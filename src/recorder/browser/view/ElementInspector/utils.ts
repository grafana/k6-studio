import { nanoid } from 'nanoid'

import { Bounds } from '@/components/Browser/types'
import { SerializedElementState } from '@/recorder/browser/serialization'
import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { BrowserEventTarget } from '@/schemas/recording'
import { ElementRole, getElementRoles } from '@/utils/dom/aria'
import { getElementDetails } from '@/utils/dom/selectors'
import { emptyToUndefined } from '@/utils/list'

import { getElementBoundsInTopFrame } from '../frameGeometry'

export interface LiveTrackedElement {
  kind: 'live'
  id: string
  roles: ElementRole[]
  target: BrowserEventTarget
  element: Element
  bounds: Bounds
}

export interface RemoteTrackedElement {
  kind: 'remote'
  id: string
  /** The selected element, as captured in its own frame. */
  state: SerializedElementState
  /** The remaining ancestor chain above the selected element, innermost first. */
  ancestors: SerializedElementState[]
  /** The selected element's frame chain, or null if it couldn't be resolved. */
  framePath: BrowserEventTarget[] | null
  /** Top-document coordinates: payload bounds plus the relay offset and top scroll. */
  bounds: Bounds
}

export type InspectedElement = LiveTrackedElement | RemoteTrackedElement

export function toTrackedElement(element: Element): LiveTrackedElement {
  const roles = getElementRoles(element)

  return {
    kind: 'live',
    id: nanoid(),
    roles: [...roles],
    target: getElementDetails(element),
    element: element,
    bounds: getElementBoundsInTopFrame(element),
  }
}

/**
 * Finalizes a remote element's top-frame bounds from the payload's own bounds
 * (viewport-relative in the frame where it was picked), the frame-hop offset
 * the relay accumulated on the way up, and the top document's own scroll.
 * Only the top frame can read its own scroll position, so this must run
 * there, once the payload has arrived.
 */
export function toRemoteTrackedElement(
  state: SerializedElementState,
  ancestors: SerializedElementState[],
  framePath: BrowserEventTarget[] | null,
  offset: { left: number; top: number }
): RemoteTrackedElement {
  return {
    kind: 'remote',
    id: nanoid(),
    state,
    ancestors,
    framePath,
    bounds: {
      top: state.bounds.top + offset.top + window.scrollY,
      left: state.bounds.left + offset.left + window.scrollX,
      width: state.bounds.width,
      height: state.bounds.height,
    },
  }
}

/**
 * Expands a remote selection to its next ancestor, mirroring
 * `toTrackedElement(parent)` for the live case. The current head's bounds
 * differ from its own payload bounds by a constant offset (the relay offset
 * plus the top scroll at the time the chain was captured); every ancestor
 * lived in the same originating frame, so applying that same offset to the
 * ancestor's own payload bounds reproduces the top-frame bounds it would have
 * had, without re-reading the (possibly since-changed) scroll position.
 */
export function expandRemoteTrackedElement(
  head: RemoteTrackedElement
): RemoteTrackedElement | undefined {
  const [nextState, ...remainingAncestors] = head.ancestors

  if (nextState === undefined) {
    return undefined
  }

  const offset = {
    left: head.bounds.left - head.state.bounds.left,
    top: head.bounds.top - head.state.bounds.top,
  }

  return {
    kind: 'remote',
    id: nanoid(),
    state: nextState,
    ancestors: remainingAncestors,
    framePath: head.framePath,
    bounds: {
      left: nextState.bounds.left + offset.left,
      top: nextState.bounds.top + offset.top,
      width: nextState.bounds.width,
      height: nextState.bounds.height,
    },
  }
}

/** The target locator details for an inspected element, live or remote. */
export function getTarget(element: InspectedElement): BrowserEventTarget {
  return element.kind === 'live' ? element.target : element.state.target
}

/** The ARIA roles for an inspected element, live or remote. */
export function getRoles(element: InspectedElement): ElementRole[] {
  return element.kind === 'live' ? element.roles : element.state.roles
}

/** The top-frame bounds for an inspected element, live or remote. */
export function getBounds(element: InspectedElement): Bounds {
  return element.bounds
}

/**
 * Maps a remote element's frame path to CSS-only locator options for the
 * `highlight-elements` message, mirroring `getCssFramePathForElement` for
 * live elements (see `frames.ts`). A null path (the ancestor chain couldn't
 * be resolved) maps to `undefined` frames, so the highlight stays a top-frame
 * no-op instead of resolving into the wrong frame.
 */
export function toRemoteFrames(
  framePath: BrowserEventTarget[] | null
): LocatorOptions[] | undefined {
  if (framePath === null) {
    return undefined
  }

  return emptyToUndefined(
    framePath.map((frame) => cssLocatorOptions(frame.selectors.css))
  )
}
