import { Bounds } from './types'

export function toBounds(rect: DOMRect, ownerWindow: Window): Bounds {
  // `getBoundingClientRect` returns the coordinates relative to the viewport
  // and not the document, so we add the scroll position so that the element
  // is relative to the page instead. This means that content will stay in place
  // when scrolling.
  return {
    top: rect.top + ownerWindow.scrollY,
    left: rect.left + ownerWindow.scrollX,
    width: rect.width,
    height: rect.height,
  }
}

export function getElementBounds(element: Element | Range): Bounds {
  const ownerWindow =
    element instanceof Range
      ? (element.startContainer.ownerDocument?.defaultView ?? window)
      : (element.ownerDocument?.defaultView ?? window)
  return toBounds(element.getBoundingClientRect(), ownerWindow)
}
