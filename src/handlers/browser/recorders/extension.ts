import { ChildProcess, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { BrowserServer, RecordEvent } from '@/services/browser/server'
import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { PipeTransport } from '@/utils/cdp/transports/pipe'
import { WebSocketServerError } from 'extension/src/messaging/transports/webSocketServer'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import { BrowserHandler } from '../types'

import { RecordingSession, RecordingSessionEventMap } from './types'
import { getBrowserLaunchArgs } from './utils'

class BrowserExtensionRecordingSession
  extends EventEmitter<RecordingSessionEventMap>
  implements RecordingSession
{
  #process: ChildProcess
  #server: BrowserServer

  constructor(process: ChildProcess, server: BrowserServer) {
    super()

    this.#process = process
    this.#server = server

    process.once('exit', () => {
      this.emit('stop', undefined)
    })
  }

  highlightElement(selector: HighlightSelector | null): void {
    this.#server.send({
      type: 'highlight-elements',
      selector,
    })
  }

  navigateTo(url: string): void {
    this.#server.send({
      type: 'navigate',
      url,
    })
  }

  stop(): void {
    this.#process.kill()
    this.#server.stop()
  }
}

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

  const handleRecord = ({ events }: RecordEvent) => {
    browserWindow.webContents.send(BrowserHandler.BrowserEvent, events)
  }

  try {
    await browserServer.start()

    browserServer.on('record', handleRecord)

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

      process.on('exit', () => {
        reject(new Error('Browser process exited unexpectedly'))
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

    const session = new BrowserExtensionRecordingSession(process, browserServer)

    session.on('stop', () => {
      browserServer.off('record', handleRecord)
    })

    return session
  } catch (error) {
    log.error('An error occurred while starting recording: ', error)

    browserServer.off('record', handleRecord)
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
