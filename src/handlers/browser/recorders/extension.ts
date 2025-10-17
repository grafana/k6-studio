import { ChildProcess, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { BrowserServer, RecordEvent } from '@/services/browser/server'
import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { PipeTransport } from '@/utils/cdp/transports/pipe'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import { BrowserHandler } from '../types'

import { RecordingSession, RecordingSessionEventMap } from './types'
import { getBrowserLaunchArgs } from './utils'

type InitState = 'init' | 'spawned' | 'ready'

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

    const {
      promise: initRecordingSession,
      resolve,
      reject,
    } = Promise.withResolvers<BrowserExtensionRecordingSession>()

    let state: InitState = 'init'

    const process = spawn(path, args, {
      stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
    })

    process.on('spawn', async () => {
      state = 'spawned'

      try {
        const transport = PipeTransport.fromChildProcess(process)
        const client = new ChromeDevToolsClient(transport)

        const response =
          await client.extensions.loadUnpacked(getExtensionPath())

        log.log(`k6 Studio extension loaded`, response)
      } catch (error) {
        // If we fail to load the extension, we'll log the error and continue without it.
        log.error('Failed to start browser recording: ', error)

        browserWindow.webContents.send(BrowserHandler.Error, {
          reason: 'extension-load',
          fatal: false,
        })
      }

      state = 'ready'

      resolve(new BrowserExtensionRecordingSession(process, browserServer))
    })

    process.on('error', (err) => {
      reject(err)
    })

    process.once('exit', (code, signal) => {
      const errorCode = code ?? signal

      switch (state) {
        case 'init':
          reject(new Error(`Browser failed to spawn with code ${errorCode}`))
          break

        case 'spawned':
          reject(new Error(`Browser exited during startup with ${errorCode}`))
          break

        default:
          return
      }
    })

    const session = await initRecordingSession

    session.on('stop', () => {
      browserServer.off('record', handleRecord)
    })

    return session
  } catch (error) {
    browserServer.off('record', handleRecord)
    browserServer.stop()

    throw error
  }
}
