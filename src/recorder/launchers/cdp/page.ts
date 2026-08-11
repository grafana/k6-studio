import logger from 'electron-log/main'
import { z } from 'zod/v4'

import { NavigateToPageEvent, ReloadPageEvent } from '@/schemas/recording'
import {
  ChromeDevToolsClient,
  Page as CdpPage,
  Runtime as CdpRuntime,
} from '@/utils/cdp/client'
import { EventEmitter } from '@/utils/events'
import { uuid } from '@/utils/uuid'

import { Script } from './script'

const ExecutionContextAuxDataSchema = z.object({
  isDefault: z.boolean(),
  frameId: z.string(),
})

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

/**
 * Whether the target already has a document to run scripts in. Targets that
 * attach before their first document report no url at all.
 */
function hasDocument(url: string): boolean {
  return url !== '' && url !== 'about:blank'
}

function isReload(event: CdpPage.FrameStartedNavigatingEvent): boolean {
  return (
    event.navigationType === 'reload' ||
    event.navigationType === 'reloadBypassingCache'
  )
}

interface PageEventMap {
  navigate: { event: NavigateToPageEvent | ReloadPageEvent }
}

export class Page extends EventEmitter<PageEventMap> {
  #id: string
  #client: ChromeDevToolsClient
  #script: Script

  #requestedNavigation: CdpPage.FrameRequestedNavigationEvent | null = null
  #startedNavigation: CdpPage.FrameStartedNavigatingEvent | null = null

  // The default execution context of each frame in the tab. See the
  // documentOpened handler for why they are tracked.
  readonly #contexts = new Map<string, CdpRuntime.ExecutionContextId>()

  readonly #disposers: Array<() => void> = []

  // Whether any navigation has been recorded for this tab. See
  // #recordMissedEntryNavigation.
  #hasNavigation = false

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

      if (this.#startedNavigation === null) {
        logger.warn(
          'Received frameNavigated event without prior navigation events'
        )

        return
      }

      if (isReload(this.#startedNavigation)) {
        this.#hasNavigation = true

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

      // Navigations caused by something happening with the page (user interaction, script, etc)
      const isImplicitNavigation = this.#requestedNavigation !== null

      const source = isImplicitNavigation
        ? 'implicit'
        : toNavigationSource(this.#startedNavigation)

      if (source === null) {
        this.#reset()

        return
      }

      this.#hasNavigation = true

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

    // The context and document.open handlers below cannot filter by frame id
    // like the navigation handlers above: they must handle every frame in the
    // tab (e.g. a frameset child the parent document.write()s into). They
    // filter by session instead, because the generated CDP client registers
    // its listeners on the shared transport without applying its per-session
    // filter, delivering every tab's events to every Page.
    const isOwnSession = (sessionId: string | undefined) =>
      sessionId === this.#client.sessionId

    this.#disposers.push(
      this.#client.runtime.on(
        'executionContextCreated',
        ({ sessionId, data }) => {
          if (!isOwnSession(sessionId)) {
            return
          }

          const auxData = ExecutionContextAuxDataSchema.safeParse(
            data.context.auxData
          )

          if (!auxData.success || !auxData.data.isDefault) {
            return
          }

          this.#contexts.set(auxData.data.frameId, data.context.id)
        }
      ),

      this.#client.runtime.on(
        'executionContextDestroyed',
        ({ sessionId, data }) => {
          if (!isOwnSession(sessionId)) {
            return
          }

          for (const [frameId, contextId] of this.#contexts) {
            if (contextId === data.executionContextId) {
              this.#contexts.delete(frameId)
            }
          }
        }
      ),

      this.#client.runtime.on('executionContextsCleared', ({ sessionId }) => {
        if (!isOwnSession(sessionId)) {
          return
        }

        this.#contexts.clear()
      }),

      // A document replaced via document.open() loses the recording script's
      // UI and event listeners, and Chromium does not run scripts registered
      // with Page.addScriptToEvaluateOnNewDocument again for it. The frame's
      // execution context survives the replacement, so the script is
      // evaluated there again. Complements the in-page recovery mechanisms
      // (monitorDocumentChange and keepMountAtEndOfBody in
      // src/recorder/browser/view), which cannot survive document.open
      // because their observers die with the old document.
      this.#client.page.on('documentOpened', ({ sessionId, data }) => {
        if (!isOwnSession(sessionId)) {
          return
        }

        const contextId = this.#contexts.get(data.frame.id)

        if (contextId === undefined) {
          return
        }

        this.#script.evaluate(this.#client, contextId).catch((error) => {
          logger.warn(
            'Failed to re-inject recording script after document.open:',
            error
          )
        })
      })
    )

    this.#script.on('reload', () => {
      this.#client.page.reload({}).catch((error) => {
        logger.error('Failed to reload page:', error)
      })
    })
  }

  async attach({
    isInitialTab,
    hasOpener,
  }: {
    isInitialTab: boolean
    hasOpener: boolean
  }) {
    // A target paused waiting for the debugger (e.g. a popup opened with
    // noopener/noreferrer, which gets a new browsing context group) doesn't
    // process session commands until Runtime.runIfWaitingForDebugger is sent,
    // so awaiting any response before requesting resume would deadlock and
    // leave the tab paused with a spinner forever. All commands are therefore
    // dispatched up front and only then awaited. The transport sends messages
    // in call order, so the scripts are still registered before the page
    // resumes.
    //
    // Scripts run immediately only in tabs the page did not open itself. A
    // popup the page opened (window.open, target=_blank) attaches before its
    // document exists, and executing the recording script in its empty
    // initial document wedges the renderer of noopener/noreferrer popups in a
    // busy loop that blocks their first real navigation; its landing commits
    // only after the tab resumes, so the scripts registered above still catch
    // it. Every other tab (context menu, middle click) commits its first
    // document independently of the debugger pause, racing the registration,
    // so the scripts must also run in whatever document already exists.
    const runImmediately = !hasOpener

    await Promise.all([
      this.#client.page.enable(),

      // Force main-world context creation for every frame up front. Without
      // it, injecting our scripts into a frame that has no context yet (e.g.
      // a sandboxed iframe without allow-scripts) makes Chromium create the
      // context mid-injection and re-enter its script bookkeeping, hitting a
      // use-after-free that kills the whole tab with "Aw, Snap! Error code:
      // 5". Chromium fixed one variant of this in
      // https://chromium-review.googlesource.com/c/chromium/src/+/7978579 but
      // it still reproduces on Chrome 151 with our two consecutive
      // injections.
      this.#client.runtime.enable(),

      this.#client.page.setBypassCSP(true),

      this.#client.page.addScriptToEvaluateOnNewDocument({
        source: `window.__K6_STUDIO_TAB_ID__ = "${this.#id}";`,
        runImmediately,
      }),
      this.#script.inject(this.#client, runImmediately),

      // Must stay dispatched last so the commands above are queued before the
      // page resumes.
      this.#client.runtime.runIfWaitingForDebugger(),
    ])

    if (!isInitialTab) {
      await this.#recordMissedEntryNavigation()
    }

    return this
  }

  /**
   * Records the navigation a tab attached on when its commit was never
   * reported. A tab opened through the context menu or a middle click can
   * commit its first document before `Page.enable` takes effect, leaving the
   * tab with no entry navigation to export a test from. If the commit was
   * reported after all, the regular handler recorded it and there is nothing
   * to do. The tab the recording starts in is excluded: the recorder
   * navigates it itself and that navigation is reported normally.
   */
  async #recordMissedEntryNavigation() {
    const { frameTree } = await this.#client.page.getFrameTree()

    if (this.#hasNavigation || !hasDocument(frameTree.frame.url)) {
      return
    }

    this.#hasNavigation = true

    this.emit('navigate', {
      event: {
        type: 'navigate-to-page',
        eventId: uuid(),
        timestamp: Date.now(),
        source: 'address-bar',
        url: frameTree.frame.url,
        tab: this.#id,
      },
    })
  }

  navigateTo(url: string) {
    this.#client.page
      .navigate({ url, transitionType: 'other' })
      .catch((error) => {
        logger.error('Failed to navigate page:', error)
      })
  }

  #reset() {
    this.#requestedNavigation = null
    this.#startedNavigation = null
  }

  /**
   * Convenience method to log page events for debugging purposes
   */
  // oxlint-disable-next-line no-unused-private-class-members
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
    this.#disposers.forEach((dispose) => dispose())

    this.#script.remove(this.#client).catch(() => {
      // Let's just assume we got here because the session was already
      // closed or the script was already removed.
    })
  }
}
