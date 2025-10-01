import { finder } from '@medv/finder'

import { ElementSelector } from '@/schemas/recording'

export function generateSelector(element: Element): ElementSelector {
  return {
    css: finder(element, {}),
    testId: element.getAttribute('data-testid') || undefined,
  }
}
