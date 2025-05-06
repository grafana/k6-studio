import { css } from '@emotion/react'
import { FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { Flex } from '@/components/primitives/Flex'
import { Popover } from '@/components/primitives/Popover'
import { ElementSelector } from '@/schemas/recording'

import { client } from '../routing'

import { useGlobalClass } from './GlobalStyles'
import { Overlay } from './Overlay'
import { useTextSelection } from './TextAssertionEditor.hooks'
import { TextSelection } from './TextAssertionEditor.types'
import { TextAssertionForm } from './assertions/TextAssertionForm'
import { TextAssertionData } from './assertions/types'
import { useEscape } from './hooks/useEscape'
import { usePreventClick } from './hooks/usePreventClick'

interface TextAssertion {
  selector: ElementSelector
  text: string
}

interface TextAssertionEditorContentProps {
  selection: TextSelection
  onAdd: (assertion: TextAssertion) => void
  onClose: () => void
}

function TextAssertionEditorContent({
  selection,
  onAdd,
  onClose,
}: TextAssertionEditorContentProps) {
  const [assertion, setAssertion] = useState<TextAssertionData>({
    type: 'text',
    selector: selection.selector.css,
    text: selection.text,
  })

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])

  const handleChange = (assertion: TextAssertionData) => {
    setAssertion(assertion)
  }

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    onAdd({
      selector: {
        css: assertion.selector,
      },
      text: assertion.text,
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
            <TextAssertionForm
              canEditSelector
              assertion={assertion}
              onChange={handleChange}
            />

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
  usePreventClick({
    enabled: selection !== null,
  })

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
        <TextAssertionEditorContent
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
