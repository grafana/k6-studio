import { Locator } from 'k6/browser'

import { ActionLocator } from '@/main/runner/schema'

import { ProxyOptions } from '../utils'

export function locatorProxy(
  target: Locator,
  locator: ActionLocator
): ProxyOptions<Locator> {
  return {
    target,
    tracking: {
      check(options) {
        return {
          method: 'locator.check',
          locator,
          options,
        }
      },

      clear(options) {
        return {
          method: 'locator.clear',
          locator,
          options,
        }
      },

      click(options) {
        return {
          method: 'locator.click',
          locator,
          options: {
            ...options,
          },
        }
      },

      dblclick(options) {
        return {
          method: 'locator.dblclick',
          locator,
          options: {
            ...options,
          },
        }
      },

      fill(value: string, options) {
        return {
          method: 'locator.fill',
          locator,
          value,
          options,
        }
      },

      focus(options) {
        return {
          method: 'locator.focus',
          locator,
          options,
        }
      },

      hover(options) {
        return {
          method: 'locator.hover',
          locator,
          options,
        }
      },

      press(key: string, options) {
        return {
          method: 'locator.press',
          locator,
          key,
          options,
        }
      },

      selectOption(values, options) {
        return {
          method: 'locator.selectOption',
          locator,
          values: Array.of(values)
            .flat()
            .map((value) => (typeof value === 'string' ? { value } : value)),
          options,
        }
      },

      setChecked(checked: boolean, options) {
        return {
          method: 'locator.setChecked',
          locator,
          checked,
          options,
        }
      },

      tap(options) {
        return {
          method: 'locator.tap',
          locator,
          options,
        }
      },

      type(text: string, options) {
        return {
          method: 'locator.type',
          locator,
          text,
          options,
        }
      },

      uncheck(options) {
        return {
          method: 'locator.uncheck',
          locator,
          options,
        }
      },

      waitFor(options) {
        return {
          method: 'locator.waitFor',
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
