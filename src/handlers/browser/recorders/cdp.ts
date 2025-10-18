import { ChildProcess, spawn } from 'child_process'

import { BrowserServer } from '@/services/browser/server'
import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { WebSocketTransport } from '@/utils/cdp/transports/webSocket'
import { readResource } from '@/utils/resources'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import {
  BrowserLaunchError,
  RecordingSession,
  RecordingSessionEventMap,
} from './types'
import { getBrowserLaunchArgs } from './utils'

type InitState = 'init' | 'spawned' | 'ready'

const DEBUGGER_PORT = 9222

const BROWSER_CDP_ARGS = [`--remote-debugging-port=${DEBUGGER_PORT}`]

class CDPRecordingSession
  extends EventEmitter<RecordingSessionEventMap>
  implements RecordingSession
{
  #process: ChildProcess
  #server: BrowserServer

  constructor(process: ChildProcess, server: BrowserServer) {
    super()

    this.#process = process
    this.#server = server

    this.#process.on('exit', () => {
      this.emit('stop', undefined)

      this.#server.stop()
    })

    this.#process.on('error', (error) => {
      this.emit('error', { error })

      this.#server.stop()
    })
  }

  highlightElement(_selector: HighlightSelector | null): void {}

  navigateTo(_url: string): void {}

  stop(): void {}
}

async function connectToDebugger(port: number): Promise<ChromeDevToolsClient> {
  const script = await readResource('browser-script')

  const transport = await WebSocketTransport.connect({
    port,
  })

  const client = new ChromeDevToolsClient(transport)

  client.target.on('attachedToTarget', async ({ data }) => {
    if (data.targetInfo.type !== 'page') {
      return
    }

    try {
      const sessionClient = client.withSession(data.sessionId)

      await sessionClient.page.enable()
      await sessionClient.page.addScriptToEvaluateOnNewDocument(
        script,
        undefined,
        undefined,
        true
      )

      await sessionClient.runtime.runIfWaitingForDebugger()
    } catch (error) {
      console.error('Failed to initialize page session: ', error)
    }
  })

  await client.target.setAutoAttach(true, true, true, [
    { type: 'page', exclude: false },
    { exclude: true },
  ])

  return client
}

export async function launchBrowserWithDevToolsProtocol(
  url: string | undefined
) {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
    args: BROWSER_CDP_ARGS,
  })

  const server = new BrowserServer()

  try {
    await server.start()
  } catch (error) {
    throw new BrowserLaunchError('websocket-server-error', error)
  }

  try {
    let state: InitState = 'init'

    const {
      promise: initRecordingSession,
      resolve,
      reject,
    } = Promise.withResolvers<CDPRecordingSession>()

    const process = spawn(path, args, {
      stdio: ['ignore', 'ignore', 'ignore'],
    })

    process.on('spawn', () => {
      state = 'spawned'

      connectToDebugger(DEBUGGER_PORT)
        .then(() => {
          state = 'ready'

          resolve(new CDPRecordingSession(process, server))
        })
        .catch((error) => {
          process.kill()

          reject(new BrowserLaunchError('extension-load', error))
        })
    })

    process.on('error', (error) => {
      reject(new BrowserLaunchError('browser-launch', error))
    })

    process.on('exit', (code, signal) => {
      if (state === 'ready') {
        return
      }

      const errorCode = code ?? signal

      const message =
        state === 'init'
          ? `The browser process exited unexpectedly with code: ${errorCode}`
          : `The browser process exited before a connection could be established. Exit code: ${errorCode}`

      reject(new BrowserLaunchError('browser-launch', message))
    })

    return await initRecordingSession
  } catch (error) {
    server.stop()

    throw error
  }
}
