import { Locator, browser as nativeBrowser } from 'k6/browser'

import { createProxy, ProxiedMethods } from './utils'

const locatorProxy = (
  _target: Locator,
  selector: string
): ProxiedMethods<Locator> => {
  return {
    click: {
      track: () => {
        return {
          type: 'click',
          selector,
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
          proxy: locatorProxy,
        },
      }
    },
  },
})
