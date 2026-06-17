import { Page } from 'k6/browser'

import { createSingleEntryGuard, ProxyOptions, trackLog } from '../utils'

import { elementLocatorProxies } from './elementLocators'
import { frameLocatorProxy } from './frameLocator'
import { isLocatorMethod } from './utils'

const shouldInstrument = createSingleEntryGuard()

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
        if (typeof method === 'symbol' || isLocatorMethod(method)) {
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
    },
  }
}
