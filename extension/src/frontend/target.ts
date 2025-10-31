import { BrowserEventTarget } from '@/schemas/recording'

import { generateSelectors } from '../selectors'
import { getAriaDetails } from '../utils/aria'

export function getEventTarget(element: Element): BrowserEventTarget {
  return {
    selectors: generateSelectors(element),
    aria: getAriaDetails(element),
  }
}
