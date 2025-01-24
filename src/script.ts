import { app, dialog, BrowserWindow } from 'electron'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline/promises'
import { K6Check, K6Log } from './types'
import { getArch, getPlatform } from './utils/electron'
import { parse, TSESTree as ts } from '@typescript-eslint/typescript-estree'
import { format } from 'prettier'
import { getExports, traverse } from './codegen/estree/traverse'
import { readFile } from 'node:fs/promises'
// eslint-disable-next-line import/default
import estree from 'prettier/plugins/estree'
import { NodeType } from './codegen/estree/nodes'
import {
  constDeclarator,
  declareConst,
  exportNamed,
  fromObjectLiteral,
  identifier,
} from './codegen/estree'

export type K6Process = ChildProcessWithoutNullStreams

export const showScriptSelectDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Javascript script', extensions: ['js'] }],
  })

  if (result.canceled) return

  const [scriptPath] = result.filePaths
  return scriptPath
}

export const runScript = async (
  browserWindow: BrowserWindow,
  scriptPath: string,
  proxyPort: number,
  enableUsageReport: boolean
) => {
  const modifiedScript = await enhanceScriptFromPath(scriptPath)
  const modifiedScriptPath = path.join(
    app.getPath('temp'),
    'k6-studio-script.js'
  )
  await writeFile(modifiedScriptPath, modifiedScript)

  const proxyEnv = {
    HTTP_PROXY: `http://localhost:${proxyPort}`,
    HTTPS_PROXY: `http://localhost:${proxyPort}`,
    NO_PROXY: 'jslib.k6.io',
  }

  let k6Path: string

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    k6Path = path.join(
      app.getAppPath(),
      'resources',
      getPlatform(),
      getArch(),
      'k6'
    )
  } else {
    // only the architecture directory will be in resources on the packaged app
    k6Path = path.join(process.resourcesPath, getArch(), 'k6')
  }

  // add .exe on windows
  k6Path += getPlatform() === 'win' ? '.exe' : ''

  const k6Args = [
    'run',
    modifiedScriptPath,
    '--insecure-skip-tls-verify',
    '--log-format=json',
    '--quiet',
  ]

  if (!enableUsageReport) {
    k6Args.push('--no-usage-report')
  }

  const k6 = spawn(k6Path, k6Args, {
    env: { ...process.env, ...proxyEnv },
  })

  // we use a reader to read entire lines from stderr instead of buffered data
  const stderrReader = readline.createInterface(k6.stderr)
  const stdoutReader = readline.createInterface(k6.stdout)

  stdoutReader.on('line', (data) => {
    console.log(`stdout: ${data}`)

    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const checkData: K6Check[] = JSON.parse(data)
    browserWindow.webContents.send('script:check', checkData)
  })

  stderrReader.on('line', (data) => {
    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const logData: K6Log = JSON.parse(data)
    browserWindow.webContents.send('script:log', logData)
  })

  k6.on('close', (code) => {
    console.log(`k6 process exited with code ${code}`)
    let channel = 'script:failed'
    if (code === 0) {
      channel = 'script:finished'
    } else if (code === 105) {
      channel = 'script:stopped'
    }
    browserWindow.webContents.send(channel)
  })

  return k6
}

const parseScript = (input: string) => {
  return parse(input, {
    loc: false,
    range: false,
  })
}

/**
 * It's theoretically possible that the user has imported the `k6/execution` module with the
 * same alias as our shim. In that case we need to remove the conflicting import to avoid a
 * syntax error. If they imported it using a different alias then there's no harm in keeping
 * it around.
 */
function isConflictingExecutionImport(node: ts.Node) {
  return (
    node.type === NodeType.ImportDeclaration &&
    node.source.value === 'k6/execution' &&
    node.specifiers.some(
      (specifier) =>
        specifier.type === NodeType.ImportDefaultSpecifier &&
        specifier.local.name === 'execution'
    )
  )
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

  // let browserImport: ts.ImportDeclaration | null = null
  let httpImport: ts.ImportDeclaration | null = null

  traverse(scriptAst, {
    [NodeType.ImportDeclaration](node) {
      switch (node.source.value) {
        case 'k6/http':
          httpImport = node
          break
      }
    },
  })

  if (httpImport !== null) {
    // Insert the group shim right after the http import.
    scriptAst.body = scriptAst.body
      .filter((statement) => !isConflictingExecutionImport(statement))
      .flatMap((statement) =>
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

  const options = fromObjectLiteral({
    scenarios: fromObjectLiteral({
      default: fromObjectLiteral({
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
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

  return format(script, {
    parser: 'ts',
    plugins: [
      estree,
      {
        parsers: {
          ts: {
            astFormat: 'estree',
            parse: () => {
              return scriptAst
            },
            locStart: () => 0,
            locEnd: () => 0,
          },
        },
      },
    ],
  })
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
