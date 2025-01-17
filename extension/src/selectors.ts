import { finder } from '@medv/finder'

export function generateSelector(element: HTMLElement) {
  return finder(element, {})
}
