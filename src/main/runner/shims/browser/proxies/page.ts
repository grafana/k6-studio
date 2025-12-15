import { Page } from 'k6/browser'

import { ProxyOptions } from '../utils'

import { locatorProxy } from './locator'
import { isLocatorMethod } from './utils'

export function pageProxy(target: Page): ProxyOptions<Page> {
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

      $default(method, ...args) {
        if (isLocatorMethod(method)) {
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
      getByAltText(target, text) {
        return locatorProxy(target, {
          type: 'alt',
          text: text.toString(),
        })
      },
      getByLabel(target, label) {
        return locatorProxy(target, {
          type: 'label',
          label: label.toString(),
        })
      },
      getByPlaceholder(target, placeholder) {
        return locatorProxy(target, {
          type: 'placeholder',
          placeholder: placeholder.toString(),
        })
      },
      getByTitle(target, title) {
        return locatorProxy(target, {
          type: 'title',
          title: title.toString(),
        })
      },
      getByText(target, text) {
        return locatorProxy(target, {
          type: 'text',
          text: text.toString(),
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
