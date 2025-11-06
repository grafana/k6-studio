import logger from 'electron-log/main'

import { NavigateToPageEvent, ReloadPageEvent } from '@/schemas/recording'
import { ChromeDevToolsClient, Page as CdpPage } from '@/utils/cdp/client'
import { uuid } from '@/utils/uuid'
import { EventEmitter } from 'extension/src/utils/events'

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

  async attach() {
    await this.#client.page.enable()
    await this.#client.page.setBypassCSP(true)

    await this.#client.page.addScriptToEvaluateOnNewDocument({
      source: `window.__K6_STUDIO_TAB_ID__ = "${this.#id}";`,
      runImmediately: true,
    })

    await this.#script.inject(this.#client)

    await this.#client.runtime.runIfWaitingForDebugger()

    return this
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
