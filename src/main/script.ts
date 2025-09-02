import { parse, TSESTree as ts } from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'
import { app, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile, unlink } from 'fs/promises'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'path'
import readline from 'readline/promises'

import { ScriptHandler } from '@/handlers/script/types'
import { ArchiveError, K6Client } from '@/utils/k6/client'

import {
  constDeclarator,
  declareConst,
  exportNamed,
  fromObjectLiteral,
  identifier,
} from '../codegen/estree'
import { NodeType } from '../codegen/estree/nodes'
import { getExports, traverse } from '../codegen/estree/traverse'
import {
  TEMP_K6_ARCHIVE_PATH,
  TEMP_SCRIPT_SUFFIX,
} from '../constants/workspace'
import { K6Check, K6Log } from '../types'
import { getArch, getPlatform } from '../utils/electron'

export type K6Process = ChildProcessWithoutNullStreams

const spawnK6 = ({
  args,
  env = {},
  onStdOut = () => {},
  onStdErr = () => {},
  onClose = () => {},
}: {
  args: string[]
  env?: NodeJS.ProcessEnv
  onStdOut?: (data: string) => void
  onStdErr?: (data: string) => void
  onClose?: (code: number) => void
}) => {
  let k6Path: string

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    k6Path = path.join(
      app.getAppPath(),
      'resources',
      getPlatform(),
      getArch(),
      'k6'
    )
  } else {
    k6Path = path.join(process.resourcesPath, getArch(), 'k6')
  }

  // add .exe on windows
  k6Path += getPlatform() === 'win' ? '.exe' : ''

  const k6 = spawn(k6Path, args, {
    env: { ...process.env, ...env },
  })

  const stderrReader = readline.createInterface(k6.stderr)
  const stdoutReader = readline.createInterface(k6.stdout)

  stdoutReader.on('line', onStdOut)
  stderrReader.on('line', onStdErr)
  k6.on('close', onClose)

  return k6
}

export const showScriptSelectDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'k6 test script', extensions: ['js'] }],
  })

  if (result.canceled) return

  const [scriptPath] = result.filePaths
  return scriptPath
}

export const getTempScriptName = () => {
  return `.${Math.random().toString(36).substring(7)}${TEMP_SCRIPT_SUFFIX}`
}

export const runScript = async ({
  scriptPath,
  proxyPort,
  usageReport,
  browserWindow,
}: {
  scriptPath: string
  proxyPort: number
  usageReport: boolean
  browserWindow: BrowserWindow
}) => {
  // 1. Get an enhanced version of the script content
  const modifiedScript = await enhanceScriptFromPath(scriptPath)

  // 2. Save the enhanced script content to a temp file in the same directory as the original script
  // (k6 will look for modules/data files in the same directory as the script)
  const dirname = path.dirname(scriptPath)

  const tempFileName = getTempScriptName()
  const tempScriptPath = path.join(dirname, tempFileName)

  await writeFile(tempScriptPath, modifiedScript)

  // 3. Archive the script and its dependencies
  const archivePath = await archiveScript(tempScriptPath, browserWindow)

  // 4. Delete the temp script file
  await unlink(tempScriptPath)

  // 5. Run the test
  const k6 = spawnK6({
    args: [
      'run',
      archivePath,
      '--insecure-skip-tls-verify',
      '--log-format=json',
      '--quiet',
      ...(usageReport ? [] : ['--no-usage-report']),
    ],
    env: {
      HTTP_PROXY: `http://localhost:${proxyPort}`,
      HTTPS_PROXY: `http://localhost:${proxyPort}`,
      NO_PROXY: 'jslib.k6.io',
    },
    onStdOut: createChecksHandler(browserWindow),
    onStdErr: createLogsHandler(browserWindow),
    onClose: createCloseHandler(browserWindow),
  })

  return k6
}

const parseScript = (input: string) => {
  return parse(input, {
    loc: true,
    range: true,
  })
}

const createCloseHandler = (browserWindow: BrowserWindow) => (code: number) => {
  console.log(`k6 process exited with code ${code}`)
  let channel = 'script:failed'
  if (code === 0) {
    channel = 'script:finished'
  } else if (code === 105) {
    channel = 'script:stopped'
  }
  browserWindow.webContents.send(channel)
}

const createChecksHandler =
  (browserWindow: BrowserWindow) => (data: string) => {
    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const checkData: K6Check[] = JSON.parse(data)
    browserWindow.webContents.send('script:check', checkData)
  }

const createLogsHandler = (browserWindow: BrowserWindow) => (data: string) => {
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logData: K6Log = JSON.parse(data)
  browserWindow.webContents.send('script:log', logData)
}

export const archiveScript = async (
  scriptPath: string,
  browserWindow: BrowserWindow
): Promise<string> => {
  try {
    const client = new K6Client()

    await client.archive({
      scriptPath,
      outputPath: TEMP_K6_ARCHIVE_PATH,
      logFormat: 'json',
    })

    return TEMP_K6_ARCHIVE_PATH
  } catch (error) {
    browserWindow.webContents.send(ScriptHandler.Failed)

    if (error instanceof ArchiveError) {
      for (const log of error.stderr) {
        browserWindow.webContents.send(ScriptHandler.Log, log)
      }
    }

    throw error
  }
}

interface EnhanceScriptOptions {
  script: string
  shims: {
    group: string
    checks: string
  }
}

export const enhanceScript = async ({
  script,
  shims,
}: EnhanceScriptOptions) => {
  const [groupAst, checksAst, scriptAst] = await Promise.all([
    parseScript(shims.group),
    parseScript(shims.checks),
    parseScript(script),
  ])

  if (groupAst === undefined) {
    throw new Error('Failed to parse group snippet')
  }

  if (checksAst === undefined) {
    throw new Error('Failed to parse checks snippet')
  }

  if (scriptAst === undefined) {
    throw new Error('Failed to parse script content')
  }

  let browserImport: ts.ImportDeclaration | null = null
  let httpImport: ts.ImportDeclaration | null = null

  traverse(scriptAst, {
    [NodeType.ImportDeclaration](node) {
      switch (node.source.value) {
        case 'k6/http':
          httpImport = node
          break

        case 'k6/browser':
          browserImport = node
          break
      }
    },
  })

  if (httpImport !== null) {
    // Insert the group shim right after the http import.
    scriptAst.body = scriptAst.body.flatMap((statement) =>
      statement === httpImport ? [httpImport, ...groupAst.body] : statement
    )
  }

  const exports = getExports(scriptAst)

  const hasHandleSummary = exports.some(
    (e) => e.type === 'named' && e.name === 'handleSummary'
  )

  if (!hasHandleSummary) {
    scriptAst.body.push(...checksAst.body)
  }

  // Find any existing options export and replace it with our own.
  const optionsExport = exports.find(
    (e) => e.type === 'named' && e.name === 'options'
  )

  if (optionsExport) {
    traverse(scriptAst, {
      [NodeType.Identifier](node) {
        if (node.name === 'options') {
          // It's easier to just rename the options export than to
          // remove the node itself. This is just some UUID that I
          // generated. Should be pretty unique.
          node.name = '$c26e2908c2e948ef883369abc050ce2f'
        }
      },
    })
  }

  const browserOptions =
    browserImport !== null
      ? {
          options: fromObjectLiteral({
            browser: fromObjectLiteral({
              type: 'chromium',
            }),
          }),
        }
      : null

  const options = fromObjectLiteral({
    scenarios: fromObjectLiteral({
      default: fromObjectLiteral({
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        ...browserOptions,
      }),
    }),
  })

  scriptAst.body.push(
    exportNamed({
      declaration: declareConst({
        declarations: [
          constDeclarator({
            id: identifier('options'),
            init: options,
          }),
        ],
      }),
    })
  )

  return generate(scriptAst)
}

const getSnippetPath = (snippetName: string) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return path.join(app.getAppPath(), 'resources', snippetName)
  }

  return path.join(process.resourcesPath, snippetName)
}

const enhanceScriptFromPath = async (scriptPath: string) => {
  const [groupSnippet, checksSnippet, scriptContent] = await Promise.all([
    readFile(getSnippetPath('group_snippet.js'), { encoding: 'utf-8' }),
    readFile(getSnippetPath('checks_snippet.js'), { encoding: 'utf-8' }),
    readFile(scriptPath, { encoding: 'utf-8' }),
  ])

  return enhanceScript({
    script: scriptContent,
    shims: {
      group: groupSnippet,
      checks: checksSnippet,
    },
  })
}
