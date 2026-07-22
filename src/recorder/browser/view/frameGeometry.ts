import { Bounds, Position } from '@/components/Browser/types'
import { composeBounds } from '@/components/Browser/utils'
import { getFrameOffset } from '@/utils/dom/layout'

function getTopScroll(): { x: number; y: number } {
  const top = window.top ?? window

  return { x: top.scrollX, y: top.scrollY }
}

/**
 * Bounds of an element in the top frame's document coordinates, accounting for
 * any iframes it lives in. For a top-frame element this is just its rect plus
 * the page scroll.
 */
export function getElementBoundsInTopFrame(element: Element): Bounds {
  return toTopFrameBounds(
    element.getBoundingClientRect(),
    element.ownerDocument.defaultView
  )
}

/**
 * Translates a viewport rect measured inside `frameWindow` into the top frame's
 * document coordinates. Used for element and text-range highlights that may
 * originate inside iframes.
 */
export function toTopFrameBounds(
  rect: DOMRect,
  frameWindow: Window | null
): Bounds {
  return composeBounds(rect, getFrameOffset(frameWindow), getTopScroll())
}

/**
 * Maps a client point inside `frameWindow` to the top frame's document
 * coordinates.
 */
export function toTopFramePosition(
  frameWindow: Window | null,
  clientX: number,
  clientY: number
): Position {
  const offset = getFrameOffset(frameWindow)
  const scroll = getTopScroll()

  return {
    left: clientX + offset.left + scroll.x,
    top: clientY + offset.top + scroll.y,
  }
}
