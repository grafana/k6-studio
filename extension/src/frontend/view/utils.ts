import { useInBrowserUIStore } from './store'
import { Bounds } from './types'

export function isUsingTool(): boolean {
  return (
    event instanceof FocusEvent && useInBrowserUIStore.getState().tool !== null
  )
}

export function shouldSkipEvent(event: Event): boolean {
  const store = useInBrowserUIStore.getState()

  if (store.tool !== null || store.isCaptureBlocked) {
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

export function toBounds(rect: DOMRect): Bounds {
  // `getBoundingClientRect` returns the coordinates relative to the viewport
  // and not the document, so we add the scroll position so that the element
  // is relative to the page instead. This means that content will stay in place
  // when scrolling.
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  }
}

export function getElementBounds(element: Element | Range): Bounds {
  return toBounds(element.getBoundingClientRect())
}
