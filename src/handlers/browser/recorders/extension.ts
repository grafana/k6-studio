import { ChildProcess, spawn } from 'child_process'
import { app } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { BrowserServer } from '@/services/browser/server'
import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { PipeTransport } from '@/utils/cdp/transports/pipe'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import {
  BrowserLaunchError,
  RecordingSession,
  RecordingSessionEventMap,
} from './types'
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

    server.on('stop', () => {
      this.stop()
    })

    server.on('record', (event) => {
      this.emit('record', event)
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

export const launchBrowserWithExtension = async (url: string | undefined) => {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
    args: BROWSER_RECORDING_ARGS,
  })

  let browserServer: BrowserServer

  try {
    browserServer = await BrowserServer.start()
  } catch (error) {
    throw new BrowserLaunchError('websocket-server-error', error)
  }

  try {
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
        reject(new BrowserLaunchError('extension-load', error))

        return
      }

      state = 'ready'

      resolve(new BrowserExtensionRecordingSession(process, browserServer))
    })

    process.on('error', (error) => {
      reject(new BrowserLaunchError('browser-launch', error))
    })

    process.once('exit', (code, signal) => {
      const errorCode = code ?? signal

      switch (state) {
        case 'init':
          reject(
            new BrowserLaunchError(
              'browser-launch',
              `Browser failed to spawn with code ${errorCode}`
            )
          )
          break

        case 'spawned':
          reject(
            new BrowserLaunchError(
              'browser-launch',
              `Browser exited during startup with ${errorCode}`
            )
          )
          break

        default:
          return
      }
    })

    return await initRecordingSession
  } catch (error) {
    browserServer.stop()

    throw error
  }
}
