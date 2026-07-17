import { Bounds } from '@/components/Browser/types'
import { getElementRoles } from '@/utils/dom/aria'
import { isElement, isHTMLIFrameElement } from '@/utils/dom/realm'
import { getElementDetails } from '@/utils/dom/selectors'

import { getOwnFramePath } from '../frames'
import { getFrameAgent } from '../messaging/frames'
import {
  SerializedElementState,
  serializeElementChain,
  serializeElementState,
} from '../serialization'

import { clearChildOverlays, showChildOverlays } from './childOverlays'
import { findAssociatedControl } from './ElementInspector/ElementMenu.utils'

const HOVER_STYLE = { kind: 'hover' } as const

/**
 * Bridge the top-frame element inspector exposes so that detection running in
 * child frames can report hovered/picked elements to it. It is only present
 * while the inspector tool is active.
 */
export interface InspectionBridge {
  hover(element: Element | null): void
  pick(element: Element, clientX: number, clientY: number): void
}

/**
 * Bridge the top-frame text-selection tool exposes so child frames can report a
 * selection made inside them. Present only while the tool is active.
 */
export interface TextSelectionBridge {
  select(range: Range, commonAncestor: Element): void
}

declare global {
  interface Window {
    __K6_STUDIO_INSPECTION__?: InspectionBridge
    __K6_STUDIO_TEXT_SELECTION__?: TextSelectionBridge
  }
}

// The bridges live on the top window. Reading `window.top` can throw on a
// cross-origin frame, so guard the access and fall back to undefined.
function getTopFrameBridge<T>(read: (top: Window) => T): T | undefined {
  try {
    return window.top ? read(window.top) : undefined
  } catch {
    return undefined
  }
}

function getBridge(): InspectionBridge | undefined {
  return getTopFrameBridge((top) => top.__K6_STUDIO_INSPECTION__)
}

function getTextSelectionBridge(): TextSelectionBridge | undefined {
  return getTopFrameBridge((top) => top.__K6_STUDIO_TEXT_SELECTION__)
}

/**
 * True when a tool is active in the top frame. Same-origin child frames read
 * the top frame's bridges directly; cross-origin frames can't, so they rely on
 * the tool state broadcast over the frame agent. Used to avoid recording
 * inspector picks and text selections as real interactions.
 */
export function isTopFrameToolActive(): boolean {
  return (
    getBridge() !== undefined ||
    getTextSelectionBridge() !== undefined ||
    getFrameAgent()?.isToolActive === true
  )
}

/**
 * Reads the current selection from `document`, returning the range and the
 * element it lives in. Shared by the top frame and child-frame detection.
 */
export function readSelection(
  doc: Document
): { range: Range; commonAncestor: Element } | null {
  const selection = doc.getSelection()

  if (
    selection === null ||
    selection.rangeCount === 0 ||
    selection.isCollapsed
  ) {
    return null
  }

  const range = selection.getRangeAt(0)

  const commonAncestor = isElement(range.commonAncestorContainer)
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement

  if (commonAncestor === null) {
    return null
  }

  return { range, commonAncestor }
}

/**
 * Maps a DOMRect to a plain, structured-clone- and Zod-friendly object. Used
 * for both the local hover overlay and the payloads relayed to the top frame,
 * since a `DOMRect` instance itself isn't what `BoundsSchema` (nor the plain
 * `Bounds` overlay type) expects.
 */
function toBounds(rect: DOMRect): Bounds {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * The associated control for `element`, serialized the same way the live
 * top-frame menu computes it (`findAssociatedControl`), so a checkbox picked
 * by its wrapping label resolves to the checkbox rather than the label. The
 * argument is built by hand rather than through `toTrackedElement`: that
 * helper also computes top-frame bounds, which reads the top window's scroll
 * position and throws a SecurityError in the cross-origin frames this path
 * runs in.
 */
function resolveAssociatedControl(
  element: Element
): SerializedElementState | null {
  const control = findAssociatedControl({
    element,
    target: getElementDetails(element),
    roles: [...getElementRoles(element)],
  })

  return control ? serializeElementState(control.element) : null
}

/**
 * Runs in child frames so the top-frame inspector can pick elements inside
 * iframes. Detection has to happen in each frame because DOM events don't cross
 * iframe boundaries; matched elements are forwarded to the top frame with a
 * direct call, which only works for same-origin frames since it passes a live
 * element reference. Cross-origin frames can't reach the top frame's bridge
 * (see `getTopFrameBridge`); there the click is swallowed whenever the frame
 * agent reports the tool is active, the pick is serialized and relayed to the
 * top frame over the frame agent, and a local hover overlay stands in for the
 * live highlight the bridge would otherwise draw.
 */
export function attachInspectionDetection() {
  document.addEventListener('mouseover', (event) => {
    const bridge = getBridge()

    if (bridge !== undefined) {
      const [target] = event.composedPath()

      if (!isElement(target)) {
        return
      }

      // The inspector running inside the iframe reports the actual element
      // under the cursor, so don't highlight the iframe element itself; clear
      // the hover instead so a prior highlight can't linger over it (this
      // also avoids an expensive selector computation on the often deeply
      // nested iframe element).
      bridge.hover(isHTMLIFrameElement(target) ? null : target)

      return
    }

    if (!isTopFrameToolActive()) {
      // Cheap per-event clear instead of a subscription: as soon as the tool
      // goes inactive, the next mouseover in this frame drops any hover
      // overlay left over from while it was active.
      clearChildOverlays(HOVER_STYLE)

      return
    }

    const [target] = event.composedPath()

    if (!isElement(target) || isHTMLIFrameElement(target)) {
      clearChildOverlays(HOVER_STYLE)

      return
    }

    showChildOverlays([toBounds(target.getBoundingClientRect())], HOVER_STYLE)
  })

  document.addEventListener(
    'click',
    (event) => {
      const bridge = getBridge()

      if (bridge === undefined) {
        // No same-origin path to the top frame's inspector. A tool can still
        // be active in an ancestor frame (known here via the frame agent's
        // broadcast state), so the real page click is swallowed even though
        // there is no bridge to report the pick to directly; the pick is
        // relayed to the top frame over the frame agent instead.
        if (!isTopFrameToolActive()) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        clearChildOverlays(HOVER_STYLE)

        const [target] = event.composedPath()

        // Don't pick the iframe element itself; the inspector inside it
        // picks the real element under the cursor.
        if (!isElement(target) || isHTMLIFrameElement(target)) {
          return
        }

        const elements = serializeElementChain(target)
        const associatedControl = resolveAssociatedControl(target)
        const position = { left: event.clientX, top: event.clientY }

        void getOwnFramePath().then((framePath) => {
          getFrameAgent()?.sendElementPick({
            elements,
            associatedControl,
            framePath,
            position,
          })
        })

        return
      }

      const [target] = event.composedPath()

      if (!isElement(target)) {
        return
      }

      // The inspector is active, so swallow the page click and pick instead.
      event.preventDefault()
      event.stopPropagation()

      // Don't pick the iframe element itself; the inspector inside it picks the
      // real element under the cursor.
      if (isHTMLIFrameElement(target)) {
        return
      }

      bridge.pick(target, event.clientX, event.clientY)
    },
    { capture: true }
  )
}

/**
 * Runs in child frames so the top-frame text-selection tool can assert on text
 * selected inside an iframe. Selection state is per-document, so the selection
 * is read here and forwarded to the top frame, either directly through the
 * bridge (same-origin) or, when it's unreachable, serialized and relayed over
 * the frame agent.
 */
export function attachTextSelectionDetection() {
  let isSelecting = false

  document.addEventListener('selectstart', () => {
    if (isTopFrameToolActive()) {
      isSelecting = true
    }
  })

  document.addEventListener('mouseup', () => {
    if (!isSelecting) {
      return
    }

    isSelecting = false

    const bridge = getTextSelectionBridge()

    if (bridge !== undefined) {
      const selection = readSelection(document)

      if (selection !== null) {
        bridge.select(selection.range, selection.commonAncestor)
      }

      return
    }

    if (!isTopFrameToolActive()) {
      return
    }

    const selection = readSelection(document)

    if (selection === null) {
      return
    }

    const { range, commonAncestor } = selection

    const text = range.toString()
    const elements = serializeElementChain(commonAncestor)
    const highlights = [...range.getClientRects()].map(toBounds)
    const bounds = toBounds(range.getBoundingClientRect())

    void getOwnFramePath().then((framePath) => {
      getFrameAgent()?.sendTextSelection({
        text,
        elements,
        framePath,
        highlights,
        bounds,
      })
    })
  })
}
