import { dialog, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { writeFile, unlink } from 'fs/promises'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'path'

import type { ScriptIpcSink } from '@/bridge/scriptSinkTypes'
import { TEMP_K6_ARCHIVE_PATH, TEMP_SCRIPT_SUFFIX } from '@/constants/workspace'
import { ScriptHandler } from '@/handlers/script/types'
import { getProxyArguments } from '@/main/proxy'
import { ProxySettings } from '@/types/settings'
import { ArchiveError, K6Client } from '@/utils/k6/client'
import { shouldUseBrowserInstrumentation } from '@/utils/k6/shouldUseBrowserInstrumentation'
import { createTrackingServer } from '@/utils/k6/tracking'

import {
  instrumentScriptFromPath,
  type InstrumentEntryKind,
} from './runner/instrumentation'

export type K6Process = ChildProcessWithoutNullStreams

export type { ScriptIpcSink }

function sinkFromBrowserWindow(browserWindow: BrowserWindow): ScriptIpcSink {
  return {
    send(channel: string, ...args: unknown[]) {
      browserWindow.webContents.send(channel, ...(args as never[]))
    },
  }
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

interface RunScriptOptions {
  scriptPath: string
  usageReport: boolean
  proxySettings: ProxySettings
  browserWindow: BrowserWindow
}

export interface RunScriptWithSinkOptions {
  scriptPath: string
  usageReport: boolean
  proxySettings: ProxySettings
  sink: ScriptIpcSink
}

export const runScriptWithSink = async ({
  scriptPath,
  usageReport,
  proxySettings,
  sink,
}: RunScriptWithSinkOptions) => {
  const useBrowserInstrumentation =
    await shouldUseBrowserInstrumentation(scriptPath)

  const entryKind: InstrumentEntryKind = useBrowserInstrumentation
    ? 'browser'
    : 'http'

  const modifiedScript = await instrumentScriptFromPath(scriptPath, entryKind)

  const dirname = path.dirname(scriptPath)

  const tempFileName = getTempScriptName()
  const tempScriptPath = path.join(dirname, tempFileName)

  await writeFile(tempScriptPath, modifiedScript)

  const archivePath = await archiveScriptWithSink(tempScriptPath, sink)

  await unlink(tempScriptPath)

  const proxyArgs = await getProxyArguments(proxySettings, {
    prefix: '',
  })

  const trackingServer = useBrowserInstrumentation
    ? await createTrackingServer()
    : null

  if (trackingServer) {
    trackingServer.on('begin', (ev) => {
      sink.send(ScriptHandler.BrowserAction, ev)
    })

    trackingServer.on('end', (ev) => {
      sink.send(ScriptHandler.BrowserAction, ev)
    })

    trackingServer.on('log', (ev) => {
      sink.send(ScriptHandler.Log, ev.entry)
    })

    trackingServer.on('replay', (ev) => {
      sink.send(ScriptHandler.BrowserReplay, ev.events)
    })
  }

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
      ...(trackingServer && {
        K6_TRACKING_SERVER_PORT: String(trackingServer.port),
      }),
      ...(useBrowserInstrumentation && {
        K6_BROWSER_ARGS: proxyArgs.join(','),
      }),
      K6_TESTING_COLORIZE: 'false',
    },
  })

  testRun.on('log', ({ entry }) => {
    sink.send(ScriptHandler.Log, entry)
  })

  testRun.on('start', () => {
    sink.send(ScriptHandler.Started, {})
  })

  testRun.on('done', ({ result, checks }) => {
    sink.send(ScriptHandler.Check, checks)
    sink.send(ScriptHandler.Finished, result)
  })

  testRun.on('error', (error) => {
    log.error(error)

    sink.send(ScriptHandler.Failed)
  })

  testRun.on('stop', () => {
    sink.send(ScriptHandler.Stopped)

    trackingServer?.dispose()
  })

  return testRun
}

export const runScript = async ({
  scriptPath,
  usageReport,
  proxySettings,
  browserWindow,
}: RunScriptOptions) => {
  return runScriptWithSink({
    scriptPath,
    usageReport,
    proxySettings,
    sink: sinkFromBrowserWindow(browserWindow),
  })
}

const archiveScriptWithSink = async (
  scriptPath: string,
  sink: ScriptIpcSink
): Promise<string> => {
  try {
    const client = new K6Client()

    const scriptDir = path.dirname(scriptPath)

    await client.archive({
      scriptPath,
      outputPath: TEMP_K6_ARCHIVE_PATH,
      cwd: scriptDir,
    })

    return TEMP_K6_ARCHIVE_PATH
  } catch (error) {
    sink.send(ScriptHandler.Failed)

    if (error instanceof ArchiveError) {
      for (const logEntry of error.stderr) {
        sink.send(ScriptHandler.Log, logEntry)
      }
    }

    throw error
  }
}
