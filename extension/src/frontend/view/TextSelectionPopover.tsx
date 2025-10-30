import { css } from '@emotion/react'
import { useState } from 'react'

import { uuid } from '@/utils/uuid'

import { client } from '../routing'

import { ElementPopover } from './ElementInspector/ElementPopover'
import { TextAssertionEditor } from './ElementInspector/assertions/TextAssertionEditor'
import { TextAssertionData } from './ElementInspector/assertions/types'
import { useElementHighlight, usePinnedElement } from './ElementInspector/hooks'
import { useGlobalClass } from './GlobalStyles'
import { Overlay } from './Overlay'
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
  const { selected, expand, contract } = usePinnedElement(selection.element)

  const [assertion, setAssertion] = useState<TextAssertionData>({
    type: 'text',
    selector: selection.element.selector.css,
    text: selection.text,
  })

  const targetElement = selected ?? selection.element

  useElementHighlight(targetElement)

  const handleChange = (assertion: TextAssertionData) => {
    setAssertion(assertion)
  }

  const handleSubmit = (assertion: TextAssertionData) => {
    onAdd({
      ...assertion,
      selector: targetElement.selector.css,
    })

    onClose()
  }

  return (
    <ElementPopover
      open
      anchor={<Overlay bounds={selection.bounds} />}
      header={
        <ElementPopover.Selector
          element={targetElement}
          onExpand={expand}
          onContract={contract}
        />
      }
      onOpenChange={onClose}
    >
      <TextAssertionEditor
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

  useGlobalClass('asserting-text')
  usePreventClick({
    enabled: selection !== null,
  })

  const handleAdd = (assertion: TextAssertionData) => {
    client.send({
      type: 'record-events',
      events: [
        {
          eventId: uuid(),
          timestamp: Date.now(),
          type: 'assert',
          tab: '',
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
