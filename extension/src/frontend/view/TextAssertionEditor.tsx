import { css } from '@emotion/react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { FieldSet } from '@/components/primitives/FieldSet'
import { Flex } from '@/components/primitives/Flex'
import { Popover } from '@/components/primitives/Popover'
import { TextField } from '@/components/primitives/TextField'
import { generateSelector } from 'extension/src/selectors'

import { client } from '../routing'

import { ElementHighlight } from './ElementHighlight'
import { Bounds } from './types'

interface TextSelection {
  text: string
  selector: string
  range: Range
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
        range,
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

        return {
          ...selection,
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

interface TextAssertion {
  selector: string
  text: string
}

interface TextAssertionFormProps {
  selection: TextSelection
  onAdd: (assertion: TextAssertion) => void
}

function TextAssertionForm({ selection, onAdd }: TextAssertionFormProps) {
  const [selector, setSelector] = useState(selection.selector)
  const [text, setText] = useState(selection.text)

  const handleSelectorFocus = () => {
    client.send({
      type: 'highlight-elements',
      selector,
    })
  }

  const handleSelectorBlur = () => {
    client.send({
      type: 'highlight-elements',
      selector: null,
    })
  }

  const handleSelectorChange = (ev: ChangeEvent<HTMLInputElement>) => {
    client.send({
      type: 'highlight-elements',
      selector: ev.target.value,
    })

    setSelector(ev.target.value)
  }

  const handleTextChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value)
  }

  const handleAddClick = () => {
    onAdd({ selector, text })
  }

  return (
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

          <FieldSet>
            <TextField
              size="1"
              label="Element"
              value={selector}
              onFocus={handleSelectorFocus}
              onBlur={handleSelectorBlur}
              onChange={handleSelectorChange}
            />
            <TextField
              size="1"
              label="Contains"
              value={text}
              onChange={handleTextChange}
            />
          </FieldSet>

          <Flex justify="end">
            <Button size="1" onClick={handleAddClick}>
              Add
            </Button>
          </Flex>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function TextAssertionEditor() {
  const [selection, clearSelection] = useTextSelection()

  const handleAdd = (assertion: TextAssertion) => {
    clearSelection()

    client.send({
      type: 'record-events',
      events: [
        {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          type: 'asserted-text',
          selector: assertion.selector,
          tab: '',
          operation: {
            type: 'contains',
            value: assertion.text,
          },
        },
      ],
    })
  }

  return (
    <>
      {selection !== null && (
        <TextAssertionForm selection={selection} onAdd={handleAdd} />
      )}
    </>
  )
}
