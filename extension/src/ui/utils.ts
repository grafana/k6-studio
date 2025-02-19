import { getDefaultStore } from 'jotai'
import { tool } from './atoms'

export function shouldSkipEvent(event: Event): boolean {
  const store = getDefaultStore()

  if (store.get(tool) !== null) {
    return true
  }

  if (!event.composed) {
    return false
  }

  const [first] = event.composedPath()

  if (first instanceof Element === false) {
    return false
  }

  const root = first.getRootNode()

  return (
    root instanceof ShadowRoot &&
    root.firstElementChild !== null &&
    root.firstElementChild.hasAttribute('data-ksix-studio')
  )
}
