import { useRef, useState, useEffect } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { generateSelector } from 'extension/src/selectors'

import { TextSelection } from './TextAssertionEditor.types'

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

      const bounds = range.getBoundingClientRect()
      const highlights = Array.from(range.getClientRects()).map((rect) => {
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }
      })

      setSelection({
        text: range.toString(),
        selector: generateSelector(commonAncestor),
        range,
        highlights: highlights,
        bounds: {
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height,
        },
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

        const bounds = selection.range.getBoundingClientRect()
        const textRects = Array.from(selection.range.getClientRects()).map(
          (rect) => {
            return {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }
          }
        )

        return {
          ...selection,
          highlights: textRects,
          bounds: {
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
          },
        }
      })
    })

    observer.observe(document.body)

    return () => {
      observer.disconnect()
    }
  }, [])

  return [selection, () => setSelection(null)] as const
}
