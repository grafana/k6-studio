import { BrowserContext, Page } from 'k6/browser'

import { drainPage } from '../replayDrain'
import { injectSessionReplayIntoNewTab } from '../sessionReplay'
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

const shouldWrapWaitForEvent = createSingleEntryGuard()

export function browserContextProxy(
  target: BrowserContext
): ProxyOptions<BrowserContext> {
  if (shouldWrapWaitForEvent(target)) {
    const nativeWaitForEvent = target.waitForEvent.bind(target)

    // Pages obtained through waitForEvent were opened by the page itself, so
    // the recorder has to be injected before the page is handed to the test.
    target.waitForEvent = async (...args) => {
      const page = await nativeWaitForEvent(...args)

      try {
        await injectSessionReplayIntoNewTab(page)
      } catch {
        // Session replay is non-critical and a popup that is still navigating
        // can reject the injection; the recorder is retried after the next
        // action.
      }

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
