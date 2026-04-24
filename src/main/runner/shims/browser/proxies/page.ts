import { Page } from 'k6/browser'

import { createSingleEntryGuard, ProxyOptions, trackLog } from '../utils'

import { locatorProxy } from './locator'
import { pageDetail } from './symbols'
import { isLocatorMethod } from './utils'

const shouldInstrument = createSingleEntryGuard()

declare module 'k6/browser' {
  interface Page {
    [pageDetail]: true
  }
}

export function pageProxy(target: Page): ProxyOptions<Page> {
  target[pageDetail] = true

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
      locator(target, selector: string) {
        return locatorProxy(target, {
          type: 'css',
          selector,
        })
      },
      getByRole(target, role, options) {
        return locatorProxy(target, {
          type: 'role',
          role,
          options: {
            name: (options?.name ?? '').toString(),
          },
        })
      },
      getByAltText(target, text, options) {
        return locatorProxy(target, {
          type: 'alt',
          text: text.toString(),
          options,
        })
      },
      getByLabel(target, label, options) {
        return locatorProxy(target, {
          type: 'label',
          label: label.toString(),
          options,
        })
      },
      getByPlaceholder(target, placeholder, options) {
        return locatorProxy(target, {
          type: 'placeholder',
          placeholder: placeholder.toString(),
          options,
        })
      },
      getByTitle(target, title, options) {
        return locatorProxy(target, {
          type: 'title',
          title: title.toString(),
          options,
        })
      },
      getByText(target, text, options) {
        return locatorProxy(target, {
          type: 'text',
          text: text.toString(),
          options,
        })
      },
      getByTestId(target, testId) {
        return locatorProxy(target, {
          type: 'testid',
          testId: testId.toString(),
        })
      },
    },
  }
}
