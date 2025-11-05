import { Locator, browser as nativeBrowser } from 'k6/browser'

import { ActionLocator } from '../../schema'

import { createProxy, ProxiedMethods } from './utils'

const locatorProxy = (
  _target: Locator,
  locator: ActionLocator
): ProxiedMethods<Locator> => {
  return {
    click: {
      track: () => {
        return {
          type: 'click',
          locator,
        }
      },
    },
  }
}

export const browser = createProxy(nativeBrowser, {
  newPage: {
    proxy: (_target) => {
      return {
        goto: {
          track(url) {
            return {
              type: 'goto',
              url,
            }
          },
        },
        locator: {
          proxy(target, selector) {
            return locatorProxy(target, {
              type: 'css',
              selector,
            })
          },
        },
        getByRole: {
          proxy(target, role, options) {
            return locatorProxy(target, {
              type: 'role',
              role,
              options: {
                name: options?.name?.toString(),
              },
            })
          },
        },
        getByAltText: {
          proxy(target, text) {
            return locatorProxy(target, {
              type: 'alt',
              text: text.toString(),
            })
          },
        },
        getByLabel: {
          proxy(target, label) {
            return locatorProxy(target, {
              type: 'label',
              label: label.toString(),
            })
          },
        },
        getByPlaceholder: {
          proxy(target, placeholder) {
            return locatorProxy(target, {
              type: 'placeholder',
              placeholder: placeholder.toString(),
            })
          },
        },
        getByTitle: {
          proxy(target, title) {
            return locatorProxy(target, {
              type: 'title',
              title: title.toString(),
            })
          },
        },
        getByTestId: {
          proxy(target, testId) {
            return locatorProxy(target, {
              type: 'testid',
              testId: testId.toString(),
            })
          },
        },
        getByText: {
          proxy(target, text) {
            return locatorProxy(target, {
              type: 'text',
              text: text.toString(),
            })
          },
        },
      }
    },
  },
})
