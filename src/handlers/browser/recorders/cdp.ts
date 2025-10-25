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

    this.#server.on('focus', ({ tab }) => {
      this.#currentTab = tab
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

    this.#server.send({
      type: 'events-recorded',
      events,
    })

    this.emit('record', { events })
  }
}

interface ScriptEventMap {
  reload: EmptyObject
}

interface ScriptSession {
  client: ChromeDevToolsClient
  scriptId: string
}

class Script extends EventEmitter<ScriptEventMap> {
  #content: string
  #sessions: ScriptSession[] = []

  constructor(content: string) {
    super()

    this.#content = content
  }

  async inject(client: ChromeDevToolsClient, runImmediately = true) {
    const { identifier } = await client.page.addScriptToEvaluateOnNewDocument(
      this.#content,
      undefined,
      undefined,
      runImmediately
    )

    this.#sessions.push({
      client,
      scriptId: identifier,
    })
  }

  async remove(client: ChromeDevToolsClient) {
    const session = this.#sessions.find((s) => s.client === client)

    if (session === undefined) {
      return
    }

    await client.page.removeScriptToEvaluateOnNewDocument(session.scriptId)

    this.#sessions = this.#sessions.filter((s) => s !== session)
  }

  async reload(newContent: string) {
    this.#content = newContent

    await Promise.allSettled(
      this.#sessions.map(async (session) => {
        await this.remove(session.client)
        await this.inject(session.client, false)
      })
    )

    this.emit('reload', {})
  }
}

interface PageEventMap {
  navigate: {
    event: NavigateToPageEvent | ReloadPageEvent
  }
}

class BrowserSession extends EventEmitter<PageEventMap> {
  #client: ChromeDevToolsClient
  #script: Script

  #sessions = new Map<string, Page>()

  constructor(client: ChromeDevToolsClient, script: Script) {
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

  getPage(tabId: string) {
    return this.#sessions.get(tabId)
  }

  async reloadScript() {
    const newScript = await readResource('browser-script')

    await this.#script.reload(newScript)
  }

  #handleAttachedToTarget = async ({
    data,
  }: ChromeEvent<Target.AttachedToTargetEvent>) => {
    if (data.targetInfo.type !== 'page') {
      return
    }

    const page = new Page(
      data.targetInfo.targetId,
      this.#client.withSession(data.sessionId),
      this.#script
    )

    page.on('navigate', (ev) => {
      this.emit('navigate', ev)
    })

    this.#sessions.set(data.targetInfo.targetId, page)

    await page.attach()
  }

  #handleDetachedFromTarget = ({
    data,
  }: ChromeEvent<Target.DetachedFromTargetEvent>) => {
    const page = this.#sessions.get(data.targetId)

    if (page === undefined) {
      return
    }

    page.dispose()

    this.#sessions.delete(data.targetId)
  }

  dispose() {
    this.#client.dispose()
  }
}

class Page extends EventEmitter<PageEventMap> {
  #id: string
  #client: ChromeDevToolsClient
  #script: Script

  #requestedNavigation: CdpPage.FrameRequestedNavigationEvent | null = null
  #startedNavigation: CdpPage.FrameStartedNavigatingEvent | null = null

  constructor(id: string, client: ChromeDevToolsClient, script: Script) {
    super()

    this.#id = id
    this.#client = client
    this.#script = script

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

    this.#script.on('reload', () => {
      this.#client.page.reload().catch((error) => {
        logger.error('Failed to reload page:', error)
      })
    })
  }

  async attach() {
    await this.#client.page.enable()
    await this.#client.page.setBypassCSP(true)

    await this.#client.page.addScriptToEvaluateOnNewDocument(
      `window.__K6_STUDIO_TAB_ID__ = "${this.#id}";`,
      undefined,
      undefined,
      true
    )

    await this.#script.inject(this.#client)

    await this.#client.runtime.runIfWaitingForDebugger()

    return this
  }

  navigateTo(url: string) {
    this.#client.page.navigate(url, undefined, 'other').catch((error) => {
      logger.error('Failed to navigate page:', error)
    })
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

  dispose() {
    this.#script.remove(this.#client).catch(() => {
      // Let's just assume we got here because the session was already
      // closed or the script was already removed.
    })
  }
}

async function connectToDebugger(port: number): Promise<BrowserSession> {
  const script = await readResource('browser-script')

  const transport = await WebSocketTransport.connect({
    port,
  })

  const client = new ChromeDevToolsClient(transport)

  return new BrowserSession(client, new Script(script)).attach()
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
