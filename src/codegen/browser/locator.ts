import { LocatorOptions } from '@/schemas/locator'
import { ElementSelector } from '@/schemas/recording'

import {
  getAltTextLocator,
  getCssLocator,
  getElementLocator,
  getLabelLocator,
  getPlaceholderLocator,
  getRoleLocator,
  getTestIdLocator,
  getTitleLocator,
} from './selectors'

export function toLocatorOptions(selector: ElementSelector): LocatorOptions {
  return {
    current: getElementLocator(selector).type,
    values: {
      css: getCssLocator(selector),
      role: getRoleLocator(selector) ?? undefined,
      testid: getTestIdLocator(selector) ?? undefined,
      alt: getAltTextLocator(selector) ?? undefined,
      label: getLabelLocator(selector) ?? undefined,
      placeholder: getPlaceholderLocator(selector) ?? undefined,
      title: getTitleLocator(selector) ?? undefined,
    },
  }
}
