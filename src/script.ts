import { app, dialog, BrowserWindow } from 'electron'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline/promises'
import { K6Check, K6Log } from './types'
import { getArch, getPlatform } from './utils/electron'

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
  const modifiedScript = await enhanceScript(scriptPath)
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

const enhanceScript = async (scriptPath: string) => {
  const groupSnippet = await getJsSnippet('group_snippet.js')
  const checksSnippet = await getJsSnippet('checks_snippet.js')
  const scriptContent = await readFile(scriptPath, { encoding: 'utf-8' })
  const scriptLines = scriptContent.split('\n')
  const httpImportIndex = scriptLines.findIndex((line) =>
    line.includes('k6/http')
  )
  const handleSummaryIndex = scriptLines.findIndex(
    (line) =>
      // NOTE: if the custom handle summary is commented out we can still insert our snippet
      // this check should be improved
      line.includes('export function handleSummary(') && !line.includes('//')
  )

  // NOTE: checks works only if the user doesn't define a custom summary handler
  // if no custom handleSummary is defined we add our version to retrieve checks
  if (handleSummaryIndex === -1) {
    scriptLines.push(checksSnippet)
  }

  if (httpImportIndex !== -1) {
    scriptLines.splice(httpImportIndex + 1, 0, groupSnippet)
    const modifiedScriptContent = scriptLines.join('\n')
    return modifiedScriptContent
  } else {
    return scriptLines.join('\n')
  }
}

const getJsSnippet = async (snippetName: string) => {
  let jsSnippetPath: string

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    jsSnippetPath = path.join(app.getAppPath(), 'resources', snippetName)
  } else {
    jsSnippetPath = path.join(process.resourcesPath, snippetName)
  }

  return readFile(jsSnippetPath, { encoding: 'utf-8' })
}
