import { dialog, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { writeFile, unlink } from 'fs/promises'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'path'

import { TEMP_K6_ARCHIVE_PATH, TEMP_SCRIPT_SUFFIX } from '@/constants/workspace'
import { ScriptHandler } from '@/handlers/script/types'
import { getProxyArguments } from '@/main/proxy'
import { ProxySettings } from '@/types/settings'
import { ArchiveError, K6Client } from '@/utils/k6/client'
import { createTrackingServer } from '@/utils/k6/tracking'

import { instrumentScriptFromPath as instrumentScriptFromPath } from './runner/instrumentation'

export type K6Process = ChildProcessWithoutNullStreams

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

interface RunScriptOptions {
  scriptPath: string
  usageReport: boolean
  proxySettings: ProxySettings
  browserWindow: BrowserWindow
}

export const runScript = async ({
  scriptPath,
  usageReport,
  proxySettings,
  browserWindow,
}: RunScriptOptions) => {
  // 1. Get an instrumented version of the script content
  const modifiedScript = await instrumentScriptFromPath(scriptPath)

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

  const proxyArgs = await getProxyArguments(proxySettings, {
    prefix: '',
  })

  const trackingServer = await createTrackingServer().catch(() => null)

  // UNCOMMENT ME FOR TESTING!
  //
  // trackingServer.on('begin', (ev) => {
  //   console.log('Begin tracking event', ev)
  // })

  // trackingServer.on('end', (ev) => {
  //   console.log('End tracking event', ev)
  // })

  // 5. Run the test
  const client = new K6Client()

  const testRun = client.run({
    path: archivePath,
    quiet: true,
    insecureSkipTLSVerify: true,
    noUsageReport: !usageReport,
    env: {
      HTTP_PROXY: `http://localhost:${proxySettings.port}`,
      HTTPS_PROXY: `http://localhost:${proxySettings.port}`,
      NO_PROXY: 'jslib.k6.io',
      K6_TRACKING_SERVER_PORT: String(trackingServer?.port),
      K6_BROWSER_ARGS: proxyArgs.join(','),
      K6_TESTING_COLORIZE: 'false',
    },
  })

  testRun.on('log', ({ entry }) => {
    browserWindow.webContents.send(ScriptHandler.Log, entry)
  })

  testRun.on('done', ({ result, checks }) => {
    browserWindow.webContents.send(ScriptHandler.Check, checks)
    browserWindow.webContents.send(ScriptHandler.Finished, result)
  })

  testRun.on('abort', () => {
    browserWindow.webContents.send(ScriptHandler.Stopped)
  })

  testRun.on('error', (error) => {
    log.error(error)

    browserWindow.webContents.send(ScriptHandler.Failed)
  })

  testRun.on('stop', () => {
    trackingServer?.dispose()
  })

  return testRun
}

const archiveScript = async (
  scriptPath: string,
  browserWindow: BrowserWindow
): Promise<string> => {
  try {
    const client = new K6Client()

    await client.archive({
      scriptPath,
      outputPath: TEMP_K6_ARCHIVE_PATH,
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
