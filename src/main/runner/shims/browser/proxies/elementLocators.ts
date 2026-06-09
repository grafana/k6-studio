import { FrameLocator } from 'k6/browser'

import { ProxyOptions } from '../utils'

import { locatorProxy } from './locator'

// The locator-creating methods shared by Page and FrameLocator. Both expose the
// same `locator`/`getBy*` signatures and return a Locator, so the proxy wiring
// is identical and lives here to avoid duplicating it in each root proxy.
type ElementLocatorMethods =
  | 'locator'
  | 'getByRole'
  | 'getByAltText'
  | 'getByLabel'
  | 'getByPlaceholder'
  | 'getByTitle'
  | 'getByText'
  | 'getByTestId'

export function elementLocatorProxies(): Pick<
  ProxyOptions<FrameLocator>['proxies'],
  ElementLocatorMethods
> {
  return {
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
  }
}
