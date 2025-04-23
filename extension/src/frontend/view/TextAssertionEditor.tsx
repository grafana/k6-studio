import { css } from '@emotion/react'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { FieldSet } from '@/components/primitives/FieldSet'
import { Flex } from '@/components/primitives/Flex'
import { Popover } from '@/components/primitives/Popover'
import { TextField } from '@/components/primitives/TextField'
import { ElementSelector } from '@/schemas/recording'

import { client } from '../routing'

import { useGlobalClass } from './GlobalStyles'
import { Overlay } from './Overlay'
import { useTextSelection } from './TextAssertionEditor.hooks'
import { TextSelection } from './TextAssertionEditor.types'
import { useEscape } from './hooks/useEscape'
import { usePreventClick } from './hooks/usePreventClick'

interface TextAssertion {
  selector: ElementSelector
  text: string
}

interface TextAssertionFormProps {
  selection: TextSelection
  onAdd: (assertion: TextAssertion) => void
  onClose: () => void
}

function TextAssertionForm({
  selection,
  onAdd,
  onClose,
}: TextAssertionFormProps) {
  const [selector, setSelector] = useState(selection.selector)
  const [text, setText] = useState(selection.text)

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])

  const handleSelectorFocus = () => {
    client.send({
      type: 'highlight-elements',
      selector: {
        type: 'css',
        selector: selector.css,
      },
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
      selector: {
        type: 'css',
        selector: ev.target.value,
      },
    })

    setSelector({
      ...selector,
      css: ev.target.value,
    })
  }

  const handleTextChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value)
  }

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    onAdd({
      selector,
      text,
    })
  }

  return (
    <Popover.Root open={true} onOpenChange={onClose}>
      <Popover.Anchor asChild>
        <Overlay bounds={selection.bounds} />
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
            border: 1px solid var(--gray-6);
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

          <form
            css={css`
              display: flex;
              flex-direction: column;
              gap: var(--studio-spacing-2);
              width: 100%;
            `}
            onSubmit={handleSubmit}
          >
            <FieldSet>
              <TextField
                size="1"
                label="Element"
                value={selector.css}
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
              <Button type="submit" size="1">
                Add
              </Button>
            </Flex>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

interface TextAssertionEditorProps {
  onClose: () => void
}

export function TextAssertionEditor({ onClose }: TextAssertionEditorProps) {
  const [selection, clearSelection] = useTextSelection()

  useGlobalClass('asserting-text')
  usePreventClick(selection === null)

  const handleAdd = (assertion: TextAssertion) => {
    client.send({
      type: 'record-events',
      events: [
        {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          type: 'assert',
          tab: '',
          selector: assertion.selector,
          assertion: {
            type: 'text',
            operation: {
              type: 'contains',
              value: assertion.text,
            },
          },
        },
      ],
    })

    onClose()
  }

  const handleFormClose = () => {
    clearSelection()
  }

  useEscape(() => {
    if (selection !== null) {
      clearSelection()

      return
    }

    onClose()
  }, [selection, clearSelection, onClose])

  return (
    <>
      {selection !== null && (
        <TextAssertionForm
          selection={selection}
          onAdd={handleAdd}
          onClose={handleFormClose}
        />
      )}
      {selection?.highlights.map((rect, index) => {
        return (
          <Overlay
            key={index}
            css={css`
              background-color: var(--blue-a5);
            `}
            bounds={rect}
          />
        )
      })}
    </>
  )
}
