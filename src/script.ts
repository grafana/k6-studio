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
    '--vus=1',
    '--iterations=1',
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

// const groupSnippet = await getJsSnippet('group_snippet.js')
// const checksSnippet = await getJsSnippet('checks_snippet.js')
// const scriptContent = await readFile(scriptPath, { encoding: 'utf-8' })
// const scriptLines = scriptContent.split('\n')
// const httpImportIndex = scriptLines.findIndex((line) =>
//   line.includes('k6/http')
// )
// const handleSummaryIndex = scriptLines.findIndex(
//   (line) =>
//     // NOTE: if the custom handle summary is commented out we can still insert our snippet
//     // this check should be improved
//     line.includes('export function handleSummary(') && !line.includes('//')
// )

// // NOTE: checks works only if the user doesn't define a custom summary handler
// // if no custom handleSummary is defined we add our version to retrieve checks
// if (handleSummaryIndex === -1) {
//   scriptLines.push(checksSnippet)
// }

// if (httpImportIndex !== -1) {
//   scriptLines.splice(httpImportIndex + 1, 0, groupSnippet)
//   const modifiedScriptContent = scriptLines.join('\n')
//   return modifiedScriptContent
// } else {
//   return scriptLines.join('\n')
// }

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

export const enhanceScript = async (options: EnhanceScriptOptions) => {
  const [groupShim, checksShim, script] = await Promise.all([
    parseScript(options.shims.group),
    parseScript(options.shims.checks),
    parseScript(options.script),
  ])

  if (groupShim === undefined) {
    throw new Error('Failed to parse group snippet')
  }

  if (checksShim === undefined) {
    throw new Error('Failed to parse checks snippet')
  }

  if (script === undefined) {
    throw new Error('Failed to parse script content')
  }

  // let browserImport: ts.ImportDeclaration | null = null
  let httpImport: ts.ImportDeclaration | null = null

  traverse(script, {
    [NodeType.ImportDeclaration](node) {
      switch (node.source.value) {
        case 'k6/http':
          httpImport = node
          break

        // case 'k6/browser':
        //   browserImport = node
        //   break
      }
    },
  })

  if (httpImport !== null) {
    // Insert the group shim right after the http import.
    script.body = script.body
      .filter((statement) => !isConflictingExecutionImport(statement))
      .flatMap((statement) =>
        statement === httpImport ? [httpImport, ...groupShim.body] : statement
      )
  }

  const hasHandleSummary = getExports(script).some(
    (e) => e.type === 'named' && e.name === 'handleSummary'
  )

  if (!hasHandleSummary) {
    script.body.push(...checksShim.body)
  }

  return format(options.script, {
    parser: 'ts',
    plugins: [
      estree,
      {
        parsers: {
          ts: {
            astFormat: 'estree',
            parse: () => {
              return script
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
