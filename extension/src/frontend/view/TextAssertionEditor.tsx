import { css } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'

import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { Tooltip } from '@/components/primitives/Tooltip'
import { generateSelector } from 'extension/src/selectors'

import { ElementHighlight } from './ElementHighlight'
import { Bounds } from './types'

interface TextSelection {
  text: string
  selector: string
  bounds: Bounds
}

function useTextSelection() {
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
  }, [container])

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

      setSelection({
        text: range.toString(),
        selector: generateSelector(commonAncestor),
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

  return selection
}

export function TextAssertionEditor() {
  const selection = useTextSelection()

  return (
    <>
      {selection !== null && (
        <Tooltip.Root open={true}>
          <Tooltip.Trigger asChild>
            <ElementHighlight bounds={selection.bounds} visible={false} />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              data-inspector-tooltip
              css={css`
                user-select: none;
                font-weight: 500;
              `}
            >
              <Tooltip.Arrow />
              <strong>{selection.selector}</strong>: {selection.text}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
    </>
  )
}
