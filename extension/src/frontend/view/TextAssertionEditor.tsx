import { css } from '@emotion/react'
import { useEffect, useState } from 'react'

import { ElementSelector } from '@/schemas/recording'
import { uuid } from '@/utils/uuid'

import { client } from '../routing'

import { ElementPopover } from './ElementInspector/ElementPopover'
import { TextAssertionForm } from './ElementInspector/assertions/TextAssertionForm'
import { TextAssertionData } from './ElementInspector/assertions/types'
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

  const handleSubmit = (assertion: TextAssertionData) => {
    onAdd({
      selector: {
        css: assertion.selector,
      },
      text: assertion.text,
    })

    onClose()
  }

  return (
    <ElementPopover
      open
      anchor={<Overlay bounds={selection.bounds} />}
      header="Add text assertion"
      onOpenChange={onClose}
    >
      <TextAssertionForm
        canEditSelector
        assertion={assertion}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </ElementPopover>
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
          eventId: uuid(),
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
