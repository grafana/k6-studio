import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'
import { forEachOwningFrame } from '@/utils/dom/frameChain'
import { getCssSelector, getElementDetails } from '@/utils/dom/selectors'

/**
 * Walks from `start` up to the top frame, collecting details for each owning
 * `<iframe>` element along the way. The result is ordered outermost first, so it
 * can be replayed as a chain of frame locators. Throws if a frame in the chain
 * has no reachable owning element (e.g. a detached frame): returning the partial
 * path collected so far would resolve the locator in the wrong, shallower frame,
 * so callers fall back to no frame path instead.
 */
export function buildFramePath(
  start: Window,
  getDetails: (element: Element) => BrowserEventTarget
): BrowserEventTarget[] {
  const path: BrowserEventTarget[] = []

  forEachOwningFrame(
    start,
    () => false,
    (iframe) => path.unshift(getDetails(iframe))
  )

  return path
}

function safeFramePath(start: Window): BrowserEventTarget[] {
  try {
    return buildFramePath(start, getElementDetails)
  } catch {
    return []
  }
}

/**
 * The chain of iframe locators from the top frame down to the current frame,
 * outermost first. Empty when running in the top frame. Relies on the recorder
 * launching the browser with web security and site isolation disabled so that
 * `window.frameElement` is readable across origins.
 */
export function getFramePath(): BrowserEventTarget[] {
  return safeFramePath(window)
}

/**
 * The frame path of a specific element, which may live in a different frame than
 * the code asking for it (e.g. the top-frame inspector picking an element inside
 * an iframe). Empty when the element is in the top frame.
 */
export function getFramePathForElement(element: Element): BrowserEventTarget[] {
  return safeFramePath(element.ownerDocument.defaultView ?? window)
}

/**
 * The frame chain for an element as CSS-only locator options. The live element
 * highlight resolves frames by CSS, so this avoids the full selector and aria
 * generation per ancestor iframe that getFramePathForElement performs. Empty
 * for the top frame.
 */
export function getCssFramePathForElement(element: Element): LocatorOptions[] {
  try {
    const path = buildFramePath(
      element.ownerDocument.defaultView ?? window,
      (iframe) => ({ selectors: { css: getCssSelector(iframe) } })
    )

    return path.map((frame) => cssLocatorOptions(frame.selectors.css))
  } catch {
    return []
  }
}

/**
 * Attaches a frame path to a recorded event, omitting it for the top frame (an
 * empty path) so top-frame events stay frame-less. Centralizes the "no frames
 * means absent" rule shared by every recorder emit site.
 */
export function withFrames<Event extends BrowserEvent>(
  event: Event,
  frames: BrowserEventTarget[]
): Event {
  return frames.length > 0 ? { ...event, frames } : event
}
