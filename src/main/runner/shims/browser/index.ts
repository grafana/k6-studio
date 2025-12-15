import { BrowserContext, browser as nativeBrowser } from 'k6/browser'

import { pageProxy } from './proxies/page'
import { createProxy, ProxyOptions } from './utils'

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
