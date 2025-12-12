import {
  BrowserContext,
  Locator,
  browser as nativeBrowser,
  Page,
} from 'k6/browser'

import { ActionLocator } from '../../schema'

import { createProxy, ProxyOptions } from './utils'

function locatorProxy(
  target: Locator,
  locator: ActionLocator
): ProxyOptions<Locator> {
  return {
    target,
    tracking: {
      click(options) {
        return {
          type: 'locator.click',
          locator,
          options,
        }
      },

      fill(value: string, options) {
        return {
          type: 'locator.fill',
          locator,
          value,
          options,
        }
      },

      check(options) {
        return {
          type: 'locator.check',
          locator,
          options,
        }
      },

      uncheck(options) {
        return {
          type: 'locator.uncheck',
          locator,
          options,
        }
      },

      selectOption(values, options) {
        return {
          type: 'locator.selectOption',
          locator,
          values: Array.of(values)
            .flat()
            .map((value) => (typeof value === 'string' ? { value } : value)),
          options,
        }
      },

      waitFor(options) {
        return {
          type: 'locator.waitFor',
          locator,
          options,
        }
      },

      $default() {
        return null
      },
    },
    proxies: {},
  }
}

function pageProxy(target: Page): ProxyOptions<Page> {
  return {
    target,
    tracking: {
      goto(url: string) {
        return {
          type: 'page.goto',
          url,
        }
      },

      reload() {
        return {
          type: 'page.reload',
        }
      },

      waitForNavigation() {
        return {
          type: 'page.waitForNavigation',
        }
      },

      $default() {
        return null
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

function browserContextProxy(
  target: BrowserContext
): ProxyOptions<BrowserContext> {
  return {
    target,
    tracking: {},
    proxies: {
      newPage(target) {
        return pageProxy(target)
      },
    },
  }
}

export const browser = createProxy({
  target: nativeBrowser,
  tracking: {},
  proxies: {
    newPage(target) {
      return pageProxy(target)
    },
    newContext(target) {
      return browserContextProxy(target)
    },
    context(target) {
      if (target === null) {
        return null
      }

      return browserContextProxy(target)
    },
  },
})
