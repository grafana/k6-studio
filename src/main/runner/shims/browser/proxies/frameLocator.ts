import { FrameLocator } from 'k6/browser'

import { ProxyOptions } from '../utils'

import { elementLocatorProxies } from './elementLocators'

// A FrameLocator exposes the same locator-creating methods as a Page, plus
// nested `frameLocator`. We proxy each so that locators reached through a frame
// chain stay wrapped and keep the shim-injected `$trace` and tracking.
export function frameLocatorProxy(
  target: FrameLocator
): ProxyOptions<FrameLocator> {
  return {
    target,
    tracking: {},
    proxies: {
      ...elementLocatorProxies(),
      frameLocator(target) {
        return frameLocatorProxy(target)
      },
    },
  }
}
