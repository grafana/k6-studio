import { useRef, useState, useEffect } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'

import { toTrackedElement } from './ElementInspector/utils'
import { TextSelection } from './TextSelectionPopover.types'
import { getElementBounds, toBounds } from './utils'

function measureRange(range: Range) {
  return {
    highlights: Array.from(range.getClientRects()).map(toBounds),
    bounds: getElementBounds(range),
  }
}

export function useTextSelection() {
  const isSelecting = useRef(false)

  const container = useContainerElement()

  const [selection, setSelection] = useState<TextSelection | null>(null)

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

      const selection = document.getSelection()

      if (
        selection === null ||
        selection.rangeCount === 0 ||
        selection.isCollapsed
      ) {
        setSelection(null)

        return
      }

      const range = selection.getRangeAt(0)

      const commonAncestor =
        range.commonAncestorContainer instanceof Element
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement

      if (commonAncestor === null) {
        setSelection(null)

        return
      }

      setSelection({
        text: range.toString(),
        element: toTrackedElement(commonAncestor),
        range,
        ...measureRange(range),
      })
    }

    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setSelection((selection) => {
        if (selection === null) {
          return null
        }

        return {
          ...selection,
          ...measureRange(selection.range),
        }
      })
    })

    observer.observe(document.body)

    return () => {
      observer.disconnect()
    }
  }, [])

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
