import { BrowserContext, Page } from 'k6/browser'

import { drainPage } from '../replayDrain'
import { createSingleEntryGuard, ProxyOptions, trackLog } from '../utils'

import { elementLocatorProxies } from './elementLocators'
import { frameLocatorProxy } from './frameLocator'
import { isLocatorMethod } from './utils'

const shouldInstrument = createSingleEntryGuard()

function drainBefore<Args extends unknown[], Return>(
  page: Page,
  fn: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  return async (...args) => {
    try {
      // Drain buffered replay events before navigation destroys the document
      await drainPage(page)
    } catch {
      // The action must run even when draining fails
    }

    return await fn(...args)
  }
}

declare module 'k6/browser' {
  interface Page {
    [Symbol.pageDetail]: true
  }
}

export function pageProxy(target: Page): ProxyOptions<Page> {
  // There's no way of checking if an object is a Page instance, but by adding a symbol
  // property we can check for its existence and apply special serialization of the page.
  target[Symbol.pageDetail] = true

  if (shouldInstrument(target)) {
    target.on('console', (msg) => {
      const type = msg.type()

      if (
        type !== 'log' &&
        type !== 'info' &&
        type !== 'debug' &&
        type !== 'warning' &&
        type !== 'error'
      ) {
        return
      }

      trackLog({
        level: type === 'log' ? 'info' : type,
        msg: msg.text(),
        time: new Date().toISOString(),
        source: 'browser',
        process: 'browser',
      })
    })

    target.goto = drainBefore(target, target.goto.bind(target))
    target.reload = drainBefore(target, target.reload.bind(target))
    target.close = drainBefore(target, target.close.bind(target))
  }

  return {
    target,
    tracking: {
      goto(url: string) {
        return {
          method: 'page.goto',
          url,
        }
      },

      reload() {
        return {
          method: 'page.reload',
        }
      },

      waitForNavigation() {
        return {
          method: 'page.waitForNavigation',
        }
      },

      waitForTimeout(timeout: number) {
        return {
          method: 'page.waitForTimeout',
          timeout,
        }
      },

      close() {
        return {
          method: 'page.close',
        }
      },

      $default(method, ...args) {
        if (
          typeof method === 'symbol' ||
          isLocatorMethod(method) ||
          method === 'context'
        ) {
          return null
        }

        return {
          method: `page.*`,
          name: method,
          args,
        }
      },
    },
    proxies: {
      ...elementLocatorProxies(),
      frameLocator(target) {
        return frameLocatorProxy(target)
      },
      context(target) {
        return browserContextProxy(target)
      },
    },
  }
}

type NewTabInitializer = (page: Page) => Promise<void>

let initializeNewTab: NewTabInitializer = () => Promise.resolve()

/**
 * Registers a hook that runs on every page obtained through
 * `waitForEvent('page')`, before the page is handed to the test. k6 does not
 * apply context init scripts to pages the page opened itself (e.g. a click on
 * a target="_blank" link), so setup like the session replay recorder has to be
 * injected here instead.
 */
export function setNewTabInitializer(initializer: NewTabInitializer) {
  initializeNewTab = initializer
}

const shouldWrapWaitForEvent = createSingleEntryGuard()

export function browserContextProxy(
  target: BrowserContext
): ProxyOptions<BrowserContext> {
  if (shouldWrapWaitForEvent(target)) {
    const nativeWaitForEvent = target.waitForEvent.bind(target)

    target.waitForEvent = async (...args) => {
      const page = await nativeWaitForEvent(...args)

      await initializeNewTab(page)

      return page
    }
  }

  return {
    target,
    tracking: {},
    proxies: {
      newPage(target) {
        return pageProxy(target)
      },
      // A page opened by an action (e.g. a click on a target="_blank" link)
      // is obtained through waitForEvent and must be proxied like any other
      // page so that `$trace` and tracking work on it.
      waitForEvent(target) {
        return pageProxy(target)
      },
    },
  }
}
