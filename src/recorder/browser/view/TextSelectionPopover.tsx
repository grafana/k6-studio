import { css } from '@emotion/react'
import { nanoid } from 'nanoid'
import { useState } from 'react'

import { Overlay } from '@/components/Browser/Overlay'

import { getFramePathForElement, withFrames } from '../frames'
import { getTabId } from '../utils'

import { TextAssertionEditor } from './ElementInspector/assertions/TextAssertionEditor'
import { TextAssertionData } from './ElementInspector/assertions/types'
import { ElementPopover } from './ElementInspector/ElementPopover'
import { useElementHighlight, usePinnedElement } from './ElementInspector/hooks'
import { getTarget } from './ElementInspector/utils'
import { useGlobalClass } from './GlobalStyles'
import { useEscape } from './hooks/useEscape'
import { usePreventClick } from './hooks/usePreventClick'
import { useStudioClient } from './StudioClientProvider'
import { useTextSelection } from './TextSelectionPopover.hooks'
import { TextSelection } from './TextSelectionPopover.types'

/**
 * Expansion stays within the same frame, so a live selection's element gives
 * the right frame chain by walking the live DOM. A remote selection has no
 * live element to walk, so its own relayed frame path is used instead.
 */
function getSelectionFrames(selection: TextSelection | null) {
  if (selection === null) {
    return []
  }

  if (selection.kind === 'live') {
    return getFramePathForElement(selection.element.element)
  }

  return selection.framePath ?? []
}

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
    target: getTarget(selection.element),
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
      target: getTarget(targetElement),
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

  const client = useStudioClient()

  useGlobalClass('asserting-text')
  usePreventClick({
    enabled: selection !== null,
  })

  const handleAdd = (assertion: TextAssertionData) => {
    const frames = getSelectionFrames(selection)

    client.send({
      type: 'record-events',
      events: [
        withFrames(
          {
            eventId: nanoid(),
            timestamp: Date.now(),
            type: 'assert',
            tab: getTabId(),
            target: assertion.target,
            assertion: {
              type: 'text',
              operation: {
                type: 'contains',
                value: assertion.text,
              },
            },
          },
          frames
        ),
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
