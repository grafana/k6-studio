import { ChildProcess, spawn } from 'child_process'
import logger from 'electron-log/main'

import { BrowserEvent } from '@/schemas/recording'
import { BrowserServer } from '@/services/browser/server'
import { ChromeDevToolsClient, Transport } from '@/utils/cdp/client'
import { PipeTransport } from '@/utils/cdp/transports/pipe'
import { WebSocketTransport } from '@/utils/cdp/transports/webSocket'
import { readResource } from '@/utils/resources'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import {
  BrowserLaunchError,
  RecordingSession,
  RecordingSessionEventMap,
} from '../types'
import { getBrowserLaunchArgs } from '../utils'

import { BrowserSession } from './browser'
import { Script } from './script'

type InitState = 'init' | 'spawned' | 'ready'

const DEBUGGER_PORT = 9222

const BROWSER_CDP_ARGS = [
  '--disable-back-forward-cache',
  // Disable web security to allow our script to be executed in sandboxed iframes.
  '--disable-web-security',
  '--allow-running-insecure-content',
]

const BROWSER_CDP_WEBSOCKET_ARGS = [
  ...BROWSER_CDP_ARGS,
  `--remote-debugging-port=${DEBUGGER_PORT}`,
]

const BROWSER_CDP_PIPE_ARGS = [...BROWSER_CDP_ARGS, '--remote-debugging-pipe']

class CDPRecordingSession
  extends EventEmitter<RecordingSessionEventMap>
  implements RecordingSession
{
  #events: BrowserEvent[] = []

  #currentTab: string | null = null

  #process: ChildProcess
  #server: BrowserServer
  #session: BrowserSession

  constructor(
    process: ChildProcess,
    server: BrowserServer,
    session: BrowserSession
  ) {
    super()

    this.#process = process
    this.#server = server
    this.#session = session

    this.#process.on('exit', () => {
      this.emit('stop', undefined)

      this.#server.stop()
    })

    this.#process.on('error', (error) => {
      this.emit('error', { error })

      this.#server.stop()
    })

    this.#server.on('record', (event) => {
      if (event.source !== 'record-events') {
        return
      }

      this.#record(event.events)
    })

    this.#server.on('stop', () => {
      this.stop()
    })

    this.#server.on('load', () => {
      this.#server.send({ type: 'events-loaded', events: this.#events })
    })

    this.#server.on('focus', ({ tab }) => {
      this.#currentTab = tab
    })

    this.#session.on('navigate', ({ event }) => {
      this.#record([event])
    })
  }

  highlightElement(selector: HighlightSelector | null): void {
    this.#server.send({ type: 'highlight-elements', selector })
  }

  navigateTo(url: string): void {
    if (this.#currentTab === null) {
      return
    }

    this.#session.getPage(this.#currentTab)?.navigateTo(url)
  }

  stop(): void {
    this.#process.kill()
    this.#server.stop()
  }

  reloadScript() {
    this.#session.reloadScript().catch((error) => {
      logger.warn('Failed to reload browser script:', error)
    })
  }

  #record(events: BrowserEvent[]) {
    this.#events.push(...events)

    this.#server.send({ type: 'events-recorded', events })

    this.emit('record', { events })
  }
}

interface WebSocketOptions {
  type: 'ws'
  port: number
}

interface PipeOptions {
  type: 'pipe'
  process: ChildProcess
}

type TransportOptions = WebSocketOptions | PipeOptions

async function createTransport(options: TransportOptions) {
  switch (options.type) {
    case 'ws':
      return WebSocketTransport.connect({ port: options.port })

    case 'pipe':
      return PipeTransport.fromChildProcess(options.process)

    default:
      return exhaustive(options)
  }
}

async function connectToDebugger(
  transport: Transport
): Promise<BrowserSession> {
  const script = await readResource('browser-script')
  const client = new ChromeDevToolsClient(transport)

  return new BrowserSession(client, new Script(script)).attach()
}

export async function launchBrowserWithDevToolsProtocol(
  transport: 'ws' | 'pipe',
  url: string | undefined
) {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
    args:
      transport === 'ws' ? BROWSER_CDP_WEBSOCKET_ARGS : BROWSER_CDP_PIPE_ARGS,
  })

  let server: BrowserServer

  try {
    server = await BrowserServer.start()
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
      stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
    })

    process.on('spawn', () => {
      state = 'spawned'

      const transportOptions: TransportOptions =
        transport === 'ws'
          ? { type: 'ws', port: DEBUGGER_PORT }
          : { type: 'pipe', process }

      createTransport(transportOptions)
        .then(connectToDebugger)
        .then((session) => {
          state = 'ready'

          resolve(new CDPRecordingSession(process, server, session))
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
