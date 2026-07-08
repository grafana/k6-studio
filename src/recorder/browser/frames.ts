import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'
import { forEachOwningFrame } from '@/utils/dom/frameChain'
import { getCssSelector, getElementDetails } from '@/utils/dom/selectors'

import { FrameAgent, getFrameAgent } from './messaging/frames'

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

/**
 * Composition seam for getFramePathAsync: tries the synchronous walk first
 * (top frame and fully same-origin chains), then the postMessage protocol for
 * cross-origin frames, then gives up with no frame path.
 */
export async function resolveFramePath(
  walk: () => BrowserEventTarget[],
  agent: FrameAgent | null
): Promise<BrowserEventTarget[]> {
  try {
    return walk()
  } catch {
    // Cross-origin chain; fall through to the protocol.
  }

  if (agent === null) {
    return []
  }

  try {
    return (await agent.requestFramePath()) ?? []
  } catch {
    return []
  }
}

/**
 * The chain of iframe locators from the top frame down to the current frame,
 * outermost first. Empty when running in the top frame or when the chain can't
 * be determined. Same-origin chains resolve synchronously via frameElement;
 * cross-origin frames ask their ancestors over postMessage.
 */
export function getFramePathAsync(): Promise<BrowserEventTarget[]> {
  return resolveFramePath(
    () => buildFramePath(window, getElementDetails),
    getFrameAgent()
  )
}

/**
 * Like getFramePathAsync but distinguishes "top frame" ([]) from "unknown"
 * (null), so a parent answering a child's request over the frame agent doesn't
 * claim a wrong, shallow position in the frame tree.
 */
export async function getOwnFramePath(): Promise<BrowserEventTarget[] | null> {
  try {
    return buildFramePath(window, getElementDetails)
  } catch {
    // Cross-origin chain; ask the ancestors instead.
  }

  try {
    return (await getFrameAgent()?.requestFramePath()) ?? null
  } catch {
    return null
  }
}

/**
 * The frame path of a specific element, which may live in a different frame than
 * the code asking for it (e.g. the top-frame inspector picking an element inside
 * an iframe). Empty when the element is in the top frame.
 */
export function getFramePathForElement(element: Element): BrowserEventTarget[] {
  try {
    return buildFramePath(
      element.ownerDocument.defaultView ?? window,
      getElementDetails
    )
  } catch {
    return []
  }
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
