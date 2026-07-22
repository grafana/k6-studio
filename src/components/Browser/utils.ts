import { getFrameOffset } from '@/utils/dom/layout'

import { Bounds } from './types'

/**
 * Assembles element bounds from a viewport rect, the accumulated offset of the
 * iframes the element lives in, and the scroll of the document the overlay is
 * drawn in. Making the scroll an explicit argument keeps each call site's
 * coordinate space clear (the recorder uses the top frame's scroll, the editor
 * the app window's).
 */
export function composeBounds(
  rect: DOMRect,
  offset: { left: number; top: number },
  scroll: { x: number; y: number }
): Bounds {
  // `getBoundingClientRect` is viewport-relative; adding the scroll makes the
  // bounds document-relative so the overlay stays put while the page scrolls.
  return {
    left: rect.left + offset.left + scroll.x,
    top: rect.top + offset.top + scroll.y,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Bounds of an element that may live inside an iframe nested under `rootWindow`,
 * in the document coordinates of the app window the overlay is drawn in.
 */
export function getElementBoundsWithin(
  element: Element,
  rootWindow: Window | null
): Bounds {
  const offset = getFrameOffset(element.ownerDocument.defaultView, rootWindow)

  return composeBounds(element.getBoundingClientRect(), offset, {
    x: window.scrollX,
    y: window.scrollY,
  })
}
