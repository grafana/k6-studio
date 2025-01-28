import { finder } from '@medv/finder'

export function generateSelector(element: Element) {
  return finder(element, {})
}
