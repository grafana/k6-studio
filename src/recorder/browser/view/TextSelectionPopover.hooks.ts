import { useCallback, useRef, useState, useEffect } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'
import {
  collectLayoutShiftWindows,
  observeWindowsForLayoutShift,
} from '@/utils/dom/layout'

import { getFrameAgent, TextSelectionPayload } from '../messaging/frames'

import {
  finalizeRemoteBounds,
  toRemoteTrackedElement,
  toTrackedElement,
} from './ElementInspector/utils'
import { toTopFrameBounds } from './frameGeometry'
import { readSelection } from './inspection'
import {
  RemoteTextSelection,
  TextSelection,
} from './TextSelectionPopover.types'

function measureRange(range: Range) {
  // The range may live inside an iframe; translate its rects into the top
  // frame's coordinates so the highlights line up.
  const frameWindow = range.startContainer.ownerDocument?.defaultView ?? null

  return {
    highlights: Array.from(range.getClientRects()).map((rect) =>
      toTopFrameBounds(rect, frameWindow)
    ),
    bounds: toTopFrameBounds(range.getBoundingClientRect(), frameWindow),
  }
}

/**
 * Builds a remote selection from a relayed `text-selection` payload: the
 * element chain's head becomes the tracked element (the remaining entries are
 * its ancestors), and the bounds/highlights are finalized once from the
 * payload's own rects, the relay offset, and the top scroll. Returns null for
 * a payload with an empty element chain, which shouldn't happen in practice
 * but would otherwise leave the selection with no element to anchor on.
 */
export function buildRemoteSelection(
  payload: TextSelectionPayload
): RemoteTextSelection | null {
  const [elementState, ...ancestors] = payload.elements

  if (elementState === undefined) {
    return null
  }

  return {
    kind: 'remote',
    text: payload.text,
    element: toRemoteTrackedElement(
      elementState,
      ancestors,
      payload.framePath,
      payload.offset
    ),
    framePath: payload.framePath,
    bounds: finalizeRemoteBounds(payload.bounds, payload.offset),
    highlights: payload.highlights.map((rect) =>
      finalizeRemoteBounds(rect, payload.offset)
    ),
  }
}

export function useTextSelection() {
  const isSelecting = useRef(false)

  const container = useContainerElement()

  const [selection, setSelection] = useState<TextSelection | null>(null)

  const buildSelection = useCallback(
    (range: Range, commonAncestor: Element) => {
      setSelection({
        kind: 'live',
        text: range.toString(),
        element: toTrackedElement(commonAncestor),
        range,
        ...measureRange(range),
      })
    },
    []
  )

  useEffect(() => {
    const handleStart = (ev: Event) => {
      if (ev.target instanceof Node === false) {
        return
      }

      if (container.contains(ev.target)) {
        ev.preventDefault()

        return
      }

      setSelection(null)

      isSelecting.current = true
    }

    document.addEventListener('selectstart', handleStart)

    return () => {
      document.removeEventListener('selectstart', handleStart)
    }
  }, [selection, container])

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isSelecting.current) {
        return
      }

      isSelecting.current = false

      const result = readSelection(document)

      if (result === null) {
        setSelection(null)

        return
      }

      buildSelection(result.range, result.commonAncestor)
    }

    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [buildSelection])

  // Selections made inside iframes are detected in the child frames (see
  // attachTextSelectionDetection) and reported here with the live range.
  useEffect(() => {
    window.__K6_STUDIO_TEXT_SELECTION__ = {
      select: (range, commonAncestor) => buildSelection(range, commonAncestor),
    }

    return () => {
      delete window.__K6_STUDIO_TEXT_SELECTION__
    }
  }, [buildSelection])

  // Selections made in a cross-origin child frame can't reach the bridge
  // above, so they're relayed to the top frame over the frame agent instead
  // (see attachTextSelectionDetection).
  useEffect(() => {
    const unsubscribe = getFrameAgent()?.onTextSelection((payload) => {
      const remote = buildRemoteSelection(payload)

      if (remote !== null) {
        setSelection(remote)
      }
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  // Only a live selection has a range to re-measure; a remote selection's
  // bounds/highlights were already finalized once from the payload and can't
  // be recomputed without live DOM access.
  const selectionRange = selection?.kind === 'live' ? selection.range : null

  useEffect(() => {
    if (selectionRange === null) {
      return
    }

    const recompute = () => {
      setSelection((selection) =>
        selection === null || selection.kind !== 'live'
          ? selection
          : { ...selection, ...measureRange(selection.range) }
      )
    }

    // The selected range may live inside an iframe that scrolls independently
    // of the top document, so recompute on a shift in any frame on the path.
    const frameWindow = selectionRange.startContainer.ownerDocument?.defaultView
    const windows = collectLayoutShiftWindows(window, frameWindow)

    return observeWindowsForLayoutShift(windows, recompute)
  }, [selectionRange])

  useEffect(() => {
    if (selection !== null) {
      return
    }

    // The default behavior of links is to drag them so the user can't select
    // text inside. We work around this by preventing the dragstart event (which
    // the user shouldn't be able to do any way).
    const handleDragStart = (event: Event) => {
      event.preventDefault()

      isSelecting.current = true

      // We need to surpress the click event that will be sent after the drag
      // has ended, otherwise the user might trigger e.g. links or buttons.
      window.addEventListener(
        'click',
        (event) => {
          event.preventDefault()
          event.stopPropagation()
        },
        { capture: true, once: true }
      )
    }

    window.addEventListener('dragstart', handleDragStart)

    return () => {
      window.removeEventListener('dragstart', handleDragStart)
    }
  }, [selection])

  return [selection, () => setSelection(null)] as const
}
