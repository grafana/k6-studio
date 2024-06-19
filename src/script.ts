import { app, dialog, BrowserWindow } from 'electron'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline/promises'
import { K6Log } from './types'

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
  scriptPath: string
) => {
  const modifiedScript = await enhanceScript(scriptPath)
  const modifiedScriptPath = path.join(
    app.getPath('temp'),
    'k6-studio-script.js'
  )
  await writeFile(modifiedScriptPath, modifiedScript)

  const proxyEnv = {
    HTTP_PROXY: 'http://localhost:8080',
    HTTPS_PROXY: 'http://localhost:8080',
  }

  const k6 = spawn(
    'k6',
    [
      'run',
      modifiedScriptPath,
      '--vus=1',
      '--iterations=1',
      '--insecure-skip-tls-verify',
      '--log-format=json',
      '--no-summary',
      '--quiet',
    ],
    {
      env: { ...process.env, ...proxyEnv },
    }
  )

  // we use a reader to read entire lines from stderr instead of buffered data
  const stderrReader = readline.createInterface(k6.stderr)

  k6.stdout.on('data', (data) => {
    console.error(`stdout: ${data}`)
  })

  stderrReader.on('line', (data) => {
    console.log(`stderr: ${data}`)

    const logData: K6Log = JSON.parse(data)
    browserWindow.webContents.send('script:log', logData)
  })

  k6.on('close', (code) => {
    console.log(`k6 process exited with code ${code}`)
    browserWindow.webContents.send('script:stopped')
  })

  return k6
}

const enhanceScript = async (scriptPath: string) => {
  const groupSnippet = await getGroupSnippet()
  const scriptContent = await readFile(scriptPath, { encoding: 'utf-8' })
  const scriptLines = scriptContent.split('\n')
  const httpImportIndex = scriptLines.findIndex((line) =>
    line.includes('k6/http')
  )

  if (httpImportIndex !== -1) {
    scriptLines.splice(httpImportIndex + 1, 0, groupSnippet)
    const modifiedScriptContent = scriptLines.join('\n')
    return modifiedScriptContent
  } else {
    throw new Error('http import line not found in script')
  }
}

const getGroupSnippet = async () => {
  let groupSnippetPath: string

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    groupSnippetPath = path.join(
      app.getAppPath(),
      'resources',
      'group_snippet.js'
    )
  } else {
    groupSnippetPath = path.join(process.resourcesPath, 'group_snippet.js')
  }

  return readFile(groupSnippetPath, { encoding: 'utf-8' })
}
