import logger from 'electron-log/main'

import { NavigateToPageEvent, ReloadPageEvent } from '@/schemas/recording'
import { ChromeDevToolsClient, Page as CdpPage } from '@/utils/cdp/client'
import { EventEmitter } from '@/utils/events'
import { uuid } from '@/utils/uuid'

import { Script } from './script'

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

  // Url of an entry navigation recorded on attach, until the matching
  // frameNavigated has been ignored. See #recordEntryNavigation.
  #recordedEntryUrl: string | null = null

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

      // The navigation this page attached on was already recorded, so ignore
      // the event if it does arrive after all. Whatever the first navigation
      // turns out to be, later ones are new, so returning to the entry url is
      // recorded normally.
      const recordedEntryUrl = this.#recordedEntryUrl
      this.#recordedEntryUrl = null

      if (recordedEntryUrl === data.frame.url) {
        this.#reset()

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

      // Navigations caused by something happening with the page (user interaction, script, etc)
      const isImplicitNavigation = this.#requestedNavigation !== null

      const source = isImplicitNavigation
        ? 'implicit'
        : toNavigationSource(this.#startedNavigation)

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
      this.#client.page.reload({}).catch((error) => {
        logger.error('Failed to reload page:', error)
      })
    })
  }

  async attach({ url, isInitialTab }: { url: string; isInitialTab: boolean }) {
    // A target paused waiting for the debugger (e.g. a popup opened with
    // noopener/noreferrer, which gets a new browsing context group) doesn't
    // process session commands until Runtime.runIfWaitingForDebugger is sent,
    // so awaiting any response before requesting resume would deadlock and
    // leave the tab paused with a spinner forever. All commands are therefore
    // dispatched up front and only then awaited. The transport sends messages
    // in call order, so the scripts are still registered before the page
    // resumes.
    //
    // Scripts run immediately only in targets that already have a document.
    // A popup the page opened attaches before its document exists, and
    // executing the recording script in its empty initial document wedges the
    // renderer of noopener/noreferrer popups in a busy loop that blocks their
    // first real navigation. A tab opened through the context menu attaches
    // with its url already set: that document is the one the user goes on to
    // interact with, and it never navigates again, so registering the scripts
    // for the next document only would lose every event in it.
    const runImmediately = hasDocument(url)

    // Must happen before the page resumes: a tab that attaches while still
    // paused on its entry navigation delivers the commit events during the
    // await below, and recording the entry navigation after them would emit
    // the same navigation twice.
    if (!isInitialTab && hasDocument(url)) {
      this.#recordEntryNavigation(url)
    }

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

    return this
  }

  /**
   * Records the navigation a tab attached on. A tab opened through the context
   * menu has already committed its document by the time we attach, so no
   * navigation event ever arrives for it and the tab would have nothing to
   * export a test from. The tab the recording starts in is excluded: the
   * recorder navigates it itself and that navigation is reported normally.
   */
  #recordEntryNavigation(url: string) {
    this.#recordedEntryUrl = url

    this.emit('navigate', {
      event: {
        type: 'navigate-to-page',
        eventId: uuid(),
        timestamp: Date.now(),
        source: 'address-bar',
        url,
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
    this.#script.remove(this.#client).catch(() => {
      // Let's just assume we got here because the session was already
      // closed or the script was already removed.
    })
  }
}
