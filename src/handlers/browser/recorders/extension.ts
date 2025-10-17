import { ChildProcess, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { BrowserServer } from '@/services/browser/server'
import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { PipeTransport } from '@/utils/cdp/transports/pipe'
import { WebSocketServerError } from 'extension/src/messaging/transports/webSocketServer'

import { BrowserHandler } from '../types'

import { getBrowserLaunchArgs } from './utils'

function getExtensionPath() {
  // @ts-expect-error - Electron apps are built as CJS.
  if (import.meta.env.DEV) {
    return path.join(app.getAppPath(), '.vite/build/extension')
  }

  return path.join(process.resourcesPath, 'extension')
}

const BROWSER_RECORDING_ARGS = [
  '--remote-debugging-pipe',
  '--enable-unsafe-extension-debugging',
]

export const launchBrowserWithExtension = async (
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  url: string | undefined
) => {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
    args: BROWSER_RECORDING_ARGS,
  })

  const handleBrowserClose = (): Promise<void> => {
    browserServer.stop()

    // we send the browser:stopped event when the browser is closed
    // NOTE: on macos pressing the X button does not close the application so it won't be fired
    browserWindow.webContents.send(BrowserHandler.Closed)

    return Promise.resolve()
  }

  try {
    await browserServer.start(browserWindow)

    const process = await new Promise<ChildProcess>((resolve, reject) => {
      const process = spawn(path, args, {
        stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
      })

      process.on('spawn', () => {
        resolve(process)
      })

      process.on('error', (err) => {
        reject(err)
      })
    })

    try {
      const transport = PipeTransport.fromChildProcess(process)
      const client = new ChromeDevToolsClient(transport)

      const response = await client.extensions.loadUnpacked(getExtensionPath())

      log.log(`k6 Studio extension loaded`, response)
    } catch (error) {
      // If we fail to load the extension, we'll log the error and continue without it.
      log.error('Failed to start browser recording: ', error)

      browserWindow.webContents.send(BrowserHandler.Error, {
        reason: 'extension-load',
        fatal: false,
      })
    }

    process.once('exit', handleBrowserClose)

    return process
  } catch (error) {
    log.error('An error occurred while starting recording: ', error)

    browserServer.stop()

    browserWindow.webContents.send(BrowserHandler.Error, {
      fatal: true,
      reason:
        error instanceof WebSocketServerError
          ? 'websocket-server-error'
          : 'browser-launch',
    })

    return null
  }
}
