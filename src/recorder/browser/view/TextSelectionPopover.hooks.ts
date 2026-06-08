import { useCallback, useRef, useState, useEffect } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'
import {
  collectLayoutShiftWindows,
  observeWindowsForLayoutShift,
} from '@/utils/dom/layout'

import { toTrackedElement } from './ElementInspector/utils'
import { toTopFrameBounds } from './frameGeometry'
import { readSelection } from './inspection'
import { TextSelection } from './TextSelectionPopover.types'

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

export function useTextSelection() {
  const isSelecting = useRef(false)

  const container = useContainerElement()

  const [selection, setSelection] = useState<TextSelection | null>(null)

  const buildSelection = useCallback(
    (range: Range, commonAncestor: Element) => {
      setSelection({
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

  const selectionRange = selection?.range ?? null

  useEffect(() => {
    if (selectionRange === null) {
      return
    }

    const recompute = () => {
      setSelection((selection) =>
        selection === null
          ? null
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
