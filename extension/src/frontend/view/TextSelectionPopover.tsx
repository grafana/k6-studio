import { css } from '@emotion/react'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

import { getTabId } from '../utils'

import { ElementPopover } from './ElementInspector/ElementPopover'
import { TextAssertionEditor } from './ElementInspector/assertions/TextAssertionEditor'
import { TextAssertionData } from './ElementInspector/assertions/types'
import { useGlobalClass } from './GlobalStyles'
import { Overlay } from './Overlay'
import { useStudioClient } from './StudioClientProvider'
import { useTextSelection } from './TextSelectionPopover.hooks'
import { TextSelection } from './TextSelectionPopover.types'
import { useEscape } from './hooks/useEscape'
import { usePreventClick } from './hooks/usePreventClick'

interface TextSelectionPopoverContentProps {
  selection: TextSelection
  onAdd: (assertion: TextAssertionData) => void
  onClose: () => void
}

function TextSelectionPopoverContent({
  selection,
  onAdd,
  onClose,
}: TextSelectionPopoverContentProps) {
  const client = useStudioClient()

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
  }, [client])

  const handleChange = (assertion: TextAssertionData) => {
    setAssertion(assertion)
  }

  const handleSubmit = (assertion: TextAssertionData) => {
    onAdd(assertion)
    onClose()
  }

  return (
    <ElementPopover
      open
      anchor={<Overlay bounds={selection.bounds} />}
      header="Add text assertion"
      onOpenChange={onClose}
    >
      <TextAssertionEditor
        canEditSelector
        assertion={assertion}
        onCancel={onClose}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </ElementPopover>
  )
}

interface TextSelectionPopoverProps {
  onClose: () => void
}

export function TextSelectionPopover({ onClose }: TextSelectionPopoverProps) {
  const [selection, clearSelection] = useTextSelection()

  const client = useStudioClient()

  useGlobalClass('asserting-text')
  usePreventClick({
    enabled: selection !== null,
  })

  const handleAdd = (assertion: TextAssertionData) => {
    client.send({
      type: 'record-events',
      events: [
        {
          eventId: nanoid(),
          timestamp: Date.now(),
          type: 'assert',
          tab: getTabId(),
          target: {
            selectors: {
              css: assertion.selector,
            },
          },
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
        <TextSelectionPopoverContent
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
