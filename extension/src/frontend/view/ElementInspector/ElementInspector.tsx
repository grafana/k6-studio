import { css } from '@emotion/react'
import { useEffect, useState } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'

import { client } from '../../routing'
import { Anchor } from '../Anchor'
import { Overlay } from '../Overlay'
import { useEscape } from '../hooks/useEscape'

import { useInspectedElement } from './ElementInspector.hooks'
import { toAssertion } from './ElementInspector.utils'
import { ElementMenu } from './ElementMenu'
import { ElementPopover } from './ElementPopover'
import { AssertionForm } from './assertions/AssertionForm'
import { AssertionData } from './assertions/types'

function getHeader(assertion: AssertionData | null) {
  switch (assertion?.type) {
    case 'visibility':
      return 'Add visibility assertion'

    case 'text':
      return 'Add text assertion'

    default:
      return null
  }
}

interface ElementInspectorProps {
  onClose: () => void
}

export function ElementInspector({ onClose }: ElementInspectorProps) {
  const { pinned, element, mousePosition, unpin, expand, contract } =
    useInspectedElement()

  const [assertion, setAssertion] = useState<AssertionData | null>(null)

  useEscape(() => {
    if (pinned) {
      unpin()

      return
    }

    onClose()
  }, [pinned, onClose])

  useEffect(() => {
    client.send({
      type: 'highlight-elements',
      selector: element && {
        type: 'css',
        selector: element.selector.css,
      },
    })
  }, [element])

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])

  const handleOpenChange = () => {
    setAssertion(null)
  }

  const handleAssertionSubmit = (assertion: AssertionData) => {
    client.send({
      type: 'record-events',
      events: [
        {
          type: 'assert',
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          tab: '',
          selector: {
            css: assertion.selector,
          },
          assertion: toAssertion(assertion),
        },
      ],
    })

    onClose()
  }

  if (element === null) {
    return null
  }

  if (pinned === null) {
    return (
      <Tooltip.Root open={true}>
        <Tooltip.Trigger asChild>
          <Overlay bounds={element.bounds} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            data-inspector-tooltip
            css={css`
              font-weight: 500;
            `}
          >
            <Tooltip.Arrow />
            <strong>{element.selector.css}</strong>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <ElementPopover
      key={pinned.id}
      open
      anchor={<Anchor position={mousePosition} />}
      header={getHeader(assertion) ?? element.selector.css}
      onOpenChange={handleOpenChange}
    >
      {assertion === null && (
        <ElementMenu
          element={element}
          onSelectAssertion={setAssertion}
          onSelectionIncrease={expand}
          onSelectionDecrease={contract}
        />
      )}

      {assertion !== null && (
        <AssertionForm
          assertion={assertion}
          onSubmit={handleAssertionSubmit}
          onChange={setAssertion}
        />
      )}
    </ElementPopover>
  )
}
