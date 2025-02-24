import { useInBrowserUIStore } from './store'

export function shouldSkipEvent(event: Event): boolean {
  const store = useInBrowserUIStore.getState()

  if (store.tool !== null) {
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
