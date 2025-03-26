import { css } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { Flex } from '@/components/primitives/Flex'
import { Input } from '@/components/primitives/Input'
import { Label } from '@/components/primitives/Label'
import { Popover } from '@/components/primitives/Popover'
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
        <Popover.Root open={true}>
          <Popover.Anchor asChild>
            <ElementHighlight bounds={selection.bounds} visible={false} />
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content
              data-inspector-tooltip
              css={css`
                display: flex;
                flex-direction: column;
                gap: var(--studio-spacing-2);
                user-select: none;
                font-weight: 500;
                display: flex;
                flex-direction: column;
                min-width: 400px;
                padding: var(--studio-spacing-2) var(--studio-spacing-4);
              `}
            >
              <Popover.Arrow />
              <h1
                css={css`
                  font-size: var(--studio-font-size-1);
                  text-align: center;
                  margin: 0;
                `}
              >
                Add text assertion
              </h1>
              <div
                css={css`
                  display: grid;
                  grid-template-columns: auto 1fr;
                  gap: var(--studio-spacing-2);
                  align-items: center;
                `}
              >
                <Label size="1">Element</Label>
                <Input size="1" value={selection.selector} />
                <Label size="1">Contains</Label>
                <Input size="1" value={selection.text} />
              </div>

              <Flex justify="end">
                <Button size="1">Add</Button>
              </Flex>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </>
  )
}
