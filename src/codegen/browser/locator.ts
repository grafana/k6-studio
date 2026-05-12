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
  const values: LocatorOptions['values'] = {
    css: getCssLocator(selector),
  }

  const role = getRoleLocator(selector)
  if (role !== null) {
    values.role = role
  }

  const testid = getTestIdLocator(selector)
  if (testid !== null) {
    values.testid = testid
  }

  const alt = getAltTextLocator(selector)
  if (alt !== null) {
    values.alt = alt
  }

  const label = getLabelLocator(selector)
  if (label !== null) {
    values.label = label
  }

  const placeholder = getPlaceholderLocator(selector)
  if (placeholder !== null) {
    values.placeholder = placeholder
  }

  const title = getTitleLocator(selector)
  if (title !== null) {
    values.title = title
  }

  return {
    current: getElementLocator(selector).type,
    values,
  }
}
