import { ChildProcess, spawn } from 'child_process'
import logger from 'electron-log/main'

import {
  BrowserEvent,
  NavigateToPageEvent,
  ReloadPageEvent,
} from '@/schemas/recording'
import { BrowserServer } from '@/services/browser/server'
import {
  ChromeDevToolsClient,
  Page as CdpPage,
  Target,
  ChromeEvent,
} from '@/utils/cdp/client'
import { WebSocketTransport } from '@/utils/cdp/transports/webSocket'
import { readResource } from '@/utils/resources'
import { uuid } from '@/utils/uuid'
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

const BROWSER_CDP_ARGS = [
  `--remote-debugging-port=${DEBUGGER_PORT}`,
  '--disable-back-forward-cache',
]

function toNavigationSource(
  event: CdpPage.FrameStartedNavigatingEvent
): NavigateToPageEvent['source'] | null {
  switch (event.navigationType) {
    case 'differentDocument':
      return 'address-bar'

    case 'historyDifferentDocument':
      return 'history'

    default:
      return null
  }
}

function isReload(event: CdpPage.FrameStartedNavigatingEvent): boolean {
  return (
    event.navigationType === 'reload' ||
    event.navigationType === 'reloadBypassingCache'
  )
}

class CDPRecordingSession
  extends EventEmitter<RecordingSessionEventMap>
  implements RecordingSession
{
  #events: BrowserEvent[] = []

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
      this.#record(event.events)
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

    this.#session.on('navigate', ({ event }) => {
      this.#record([event])
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

  #record(events: BrowserEvent[]) {
    this.#events.push(...events)

    this.#server.send({
      type: 'events-recorded',
      events,
    })

    this.emit('record', { events })
  }
}

interface PageEventMap {
  navigate: {
    event: NavigateToPageEvent | ReloadPageEvent
  }
}

class BrowserSession extends EventEmitter<PageEventMap> {
  #client: ChromeDevToolsClient
  #script: string

  #sessions = new Map<string, Page>()

  constructor(client: ChromeDevToolsClient, script: string) {
    super()

    this.#client = client
    this.#script = script

    this.#client.target.on('attachedToTarget', this.#handleAttachedToTarget)
    this.#client.target.on('detachedFromTarget', this.#handleDetachedFromTarget)
  }

  async attach() {
    await this.#client.target.setAutoAttach(true, true, true, [
      { type: 'page', exclude: false },
      { exclude: true },
    ])

    return this
  }

  #handleAttachedToTarget = async ({
    data,
  }: ChromeEvent<Target.AttachedToTargetEvent>) => {
    if (data.targetInfo.type !== 'page') {
      return
    }

    const page = new Page(
      data.targetInfo.targetId,
      this.#client.withSession(data.sessionId)
    )

    page.on('navigate', (ev) => {
      this.emit('navigate', ev)
    })

    this.#sessions.set(data.sessionId, page)

    await page.attach(this.#script)
  }

  #handleDetachedFromTarget = ({
    data,
  }: ChromeEvent<Target.DetachedFromTargetEvent>) => {
    this.#sessions.delete(data.sessionId)
  }

  dispose() {
    this.#client.dispose()
  }
}

class Page extends EventEmitter<PageEventMap> {
  #id: string
  #client: ChromeDevToolsClient

  #requestedNavigation: CdpPage.FrameRequestedNavigationEvent | null = null
  #startedNavigation: CdpPage.FrameStartedNavigatingEvent | null = null

  constructor(id: string, client: ChromeDevToolsClient) {
    super()

    this.#id = id
    this.#client = client

    this.#client.page.on('frameRequestedNavigation', ({ data }) => {
      if (data.frameId !== this.#id) {
        return
      }

      this.#requestedNavigation = data
    })

    this.#client.page.on('frameStartedNavigating', ({ data }) => {
      if (data.frameId !== this.#id) {
        return
      }

      this.#startedNavigation = data
    })

    this.#client.page.on('frameNavigated', ({ data }) => {
      if (data.frame.id !== this.#id) {
        return
      }

      // Ignore navigations caused by something happening with the page (user interaction, script, etc)
      if (this.#requestedNavigation !== null) {
        return
      }

      if (this.#startedNavigation === null) {
        logger.warn(
          'Received frameNavigated event without prior navigation events'
        )

        return
      }

      if (isReload(this.#startedNavigation)) {
        this.emit('navigate', {
          event: {
            type: 'reload-page',
            eventId: uuid(),
            timestamp: Date.now(),
            tab: this.#id,
            url: data.frame.url,
          },
        })

        this.#reset()

        return
      }

      const source = toNavigationSource(this.#startedNavigation)

      if (source === null) {
        this.#reset()

        return
      }

      this.emit('navigate', {
        event: {
          type: 'navigate-to-page',
          eventId: uuid(),
          timestamp: Date.now(),
          source,
          url: data.frame.url,
          tab: this.#id,
        },
      })

      this.#reset()
    })

    this.#client.page.on('frameStoppedLoading', ({ data }) => {
      if (data.frameId !== this.#id) {
        return
      }

      this.#reset()
    })
  }

  async attach(script: string) {
    await this.#client.page.enable()
    await this.#client.page.setBypassCSP(true)

    await this.#client.page.addScriptToEvaluateOnNewDocument(
      `window.__K6_STUDIO_TAB_ID__ = "${this.#id}";`,
      undefined,
      undefined,
      true
    )

    await this.#client.page.addScriptToEvaluateOnNewDocument(
      script,
      undefined,
      undefined,
      true
    )

    await this.#client.runtime.runIfWaitingForDebugger()

    return this
  }

  #reset() {
    this.#requestedNavigation = null
    this.#startedNavigation = null
  }

  /**
   * Convencience method to log page events for debugging purposes
   */
  #trace() {
    const events: Array<keyof CdpPage.EventMap> = [
      'frameRequestedNavigation',
      'frameStartedNavigating',
      'frameNavigated',
      'frameStartedLoading',
      'frameStoppedLoading',
    ]

    for (const eventName of events) {
      this.#client.page.on(eventName, ({ data }) => {
        console.log(eventName, data)
      })
    }
  }
}

async function connectToDebugger(port: number): Promise<BrowserSession> {
  const script = await readResource('browser-script')

  const transport = await WebSocketTransport.connect({
    port,
  })

  const client = new ChromeDevToolsClient(transport)

  return new BrowserSession(client, script).attach()
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
