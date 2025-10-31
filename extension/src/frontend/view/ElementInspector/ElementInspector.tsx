import { css } from '@emotion/react'
import { upperFirst } from 'lodash-es'
import { useState } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'
import { uuid } from '@/utils/uuid'
import { ElementRole } from 'extension/src/utils/aria'

import { client } from '../../routing'
import { Anchor } from '../Anchor'
import { Overlay } from '../Overlay'
import { useEscape } from '../hooks/useEscape'

import { useInspectedElement } from './ElementInspector.hooks'
import { toAssertion } from './ElementInspector.utils'
import { ElementMenu } from './ElementMenu'
import { ElementPopover } from './ElementPopover'
import { AssertionEditor } from './assertions/AssertionEditor'
import { AssertionData } from './assertions/types'
import { useElementHighlight } from './hooks'

function getHeader(assertion: AssertionData | null) {
  switch (assertion?.type) {
    case 'visibility':
      return (
        <ElementPopover.Heading>
          Add visibility assertion
        </ElementPopover.Heading>
      )

    case 'text':
      return <ElementPopover.Heading>Add text assertion</ElementPopover.Heading>

    case 'check':
      return (
        <ElementPopover.Heading>Add check assertion</ElementPopover.Heading>
      )

    case 'text-input':
      return (
        <ElementPopover.Heading>
          Add text value assertion
        </ElementPopover.Heading>
      )

    default:
      return null
  }
}

function formatRoles(roles: ElementRole[]) {
  if (roles.length === 0) {
    return 'None'
  }

  return roles.map((role) => upperFirst(role.role)).join(', ')
}

interface ElementInspectorProps {
  onClose: () => void
}

export function ElementInspector({ onClose }: ElementInspectorProps) {
  const { pinned, element, mousePosition, reset, expand, contract } =
    useInspectedElement()

  const [assertion, setAssertion] = useState<AssertionData | null>(null)

  useElementHighlight(element)

  useEscape(() => {
    if (pinned) {
      reset()

      return
    }

    onClose()
  }, [pinned, onClose])

  const handleOpenChange = () => {
    setAssertion(null)
  }

  const handleAssertionSubmit = (assertion: AssertionData) => {
    client.send({
      type: 'record-events',
      events: [
        {
          type: 'assert',
          eventId: uuid(),
          timestamp: Date.now(),
          tab: '',
          target: assertion.target,
          assertion: toAssertion(assertion),
        },
      ],
    })

    onClose()
  }

  const handleEditorCancel = () => {
    setAssertion(null)
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
          <Tooltip.Content data-inspector-tooltip>
            <Tooltip.Arrow />
            <div
              css={css`
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 0 var(--studio-spacing-2);
              `}
            >
              <div>Tag</div>
              <div>{element.element.tagName.toLowerCase()}</div>
              <div>Selector</div>
              <div>{element.target.selectors.css}</div>
              <div>Roles</div>
              <div>{formatRoles(element.roles)}</div>
            </div>
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
      header={
        getHeader(assertion) ?? (
          <ElementPopover.Selector
            element={element}
            onContract={contract}
            onExpand={expand}
          />
        )
      }
      onOpenChange={handleOpenChange}
    >
      {assertion === null && (
        <ElementMenu element={element} onSelectAssertion={setAssertion} />
      )}

      {assertion !== null && (
        <AssertionEditor
          assertion={assertion}
          onCancel={handleEditorCancel}
          onSubmit={handleAssertionSubmit}
          onChange={setAssertion}
        />
      )}
    </ElementPopover>
  )
}
