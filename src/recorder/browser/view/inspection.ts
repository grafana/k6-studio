import { isElement, isHTMLIFrameElement } from '@/utils/dom/realm'

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
 * True when the top frame has an inspector or text-selection tool active. Child
 * frames keep their own UI store where `tool` is never set, so they detect an
 * active tool through the top frame's bridge to avoid recording inspector picks
 * and text selections as real interactions.
 */
export function isTopFrameToolActive(): boolean {
  return getBridge() !== undefined || getTextSelectionBridge() !== undefined
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
 * Runs in child frames so the top-frame inspector can pick elements inside
 * iframes. Detection has to happen in each frame because DOM events don't cross
 * iframe boundaries; matched elements are forwarded to the top frame with a
 * direct call (frames are same-process with web security disabled, so the live
 * element reference passes across the boundary).
 */
export function attachInspectionDetection() {
  document.addEventListener('mouseover', (event) => {
    const bridge = getBridge()

    if (bridge === undefined) {
      return
    }

    const [target] = event.composedPath()

    if (!isElement(target)) {
      return
    }

    // The inspector running inside the iframe reports the actual element under
    // the cursor, so don't highlight the iframe element itself; clear the hover
    // instead so a prior highlight can't linger over it (this also avoids an
    // expensive selector computation on the often deeply nested iframe element).
    bridge.hover(isHTMLIFrameElement(target) ? null : target)
  })

  document.addEventListener(
    'click',
    (event) => {
      const bridge = getBridge()

      if (bridge === undefined) {
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
 * is read here and forwarded to the top frame.
 */
export function attachTextSelectionDetection() {
  let isSelecting = false

  document.addEventListener('selectstart', () => {
    if (getTextSelectionBridge() !== undefined) {
      isSelecting = true
    }
  })

  document.addEventListener('mouseup', () => {
    if (!isSelecting) {
      return
    }

    isSelecting = false

    const bridge = getTextSelectionBridge()

    if (bridge === undefined) {
      return
    }

    const selection = readSelection(document)

    if (selection !== null) {
      bridge.select(selection.range, selection.commonAncestor)
    }
  })
}
