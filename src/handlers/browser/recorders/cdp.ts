import { ChildProcess, spawn } from 'child_process'

import { BrowserEvent } from '@/schemas/recording'
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
  #events: BrowserEvent[] = []

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

    this.#server.on('record', (event) => {
      this.#events.push(...event.events)

      this.#server.send({
        type: 'events-recorded',
        events: event.events,
      })

      this.emit('record', event)
    })

    this.#server.on('stop', () => {
      this.stop()
    })

    this.#server.on('load', () => {
      this.#server.send({
        type: 'events-loaded',
        events: this.#events,
      })
    })
  }

  highlightElement(selector: HighlightSelector | null): void {
    this.#server.send({
      type: 'highlight-elements',
      selector,
    })
  }

  navigateTo(_url: string): void {}

  stop(): void {
    this.#process.kill()
    this.#server.stop()
  }
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

    console.log('Target attached: ', data)

    try {
      const pageFrameId = data.targetInfo.targetId

      const sessionClient = client.withSession(data.sessionId)

      await sessionClient.page.enable()

      await sessionClient.page.addScriptToEvaluateOnNewDocument(
        script,
        undefined,
        undefined,
        true
      )

      sessionClient.page.on('frameRequestedNavigation', ({ data }) => {
        if (pageFrameId !== data.frameId) {
          return
        }

        console.log('frameRequestedNavigation: ', data)
      })

      sessionClient.page.on('frameNavigated', ({ data }) => {
        if (pageFrameId !== data.frame.id) {
          return
        }

        console.log('frameNavigated: ', data)
      })

      sessionClient.page.on('frameStartedNavigating', ({ data }) => {
        if (pageFrameId !== data.frameId) {
          return
        }

        console.log('frameStartedNavigating: ', data)
      })

      sessionClient.page.on('frameStartedLoading', ({ data }) => {
        if (pageFrameId !== data.frameId) {
          return
        }

        console.log('frameStartedLoading: ', data)
      })

      sessionClient.page.on('frameStoppedLoading', ({ data }) => {
        if (pageFrameId !== data.frameId) {
          return
        }

        console.log('frameStoppedLoading: ', data)
      })

      await sessionClient.runtime.runIfWaitingForDebugger()
    } catch (error) {
      console.error('Failed to initialize page session: ', error)
    }
  })

  client.target.on('detachedFromTarget', ({ data }) => {
    console.log('Target detached: ', data)
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
