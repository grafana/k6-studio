import { css } from '@emotion/react'
import { upperFirst } from 'lodash-es'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { IconButton } from '@/components/primitives/IconButton'
import { Tooltip } from '@/components/primitives/Tooltip'
import { uuid } from '@/utils/uuid'
import { ElementRole } from 'extension/src/utils/aria'

import { getTabId } from '../../utils'
import { Anchor } from '../Anchor'
import { Overlay } from '../Overlay'
import { useStudioClient } from '../StudioClientProvider'
import { useEscape } from '../hooks/useEscape'

import { useInspectedElement } from './ElementInspector.hooks'
import { toAssertion } from './ElementInspector.utils'
import { ElementMenu } from './ElementMenu'
import { ElementPopover } from './ElementPopover'
import { AssertionEditor } from './assertions/AssertionEditor'
import { AssertionData } from './assertions/types'

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

interface ElementSelectorProps {
  selector: string
  onExpand?: () => void
  onContract?: () => void
}

function ElementSelector({
  selector,
  onExpand,
  onContract,
}: ElementSelectorProps) {
  return (
    <Flex align="center" gap="1">
      <Tooltip asChild content="Select parent element">
        <IconButton disabled={onExpand === undefined} onClick={onExpand}>
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
      <ElementPopover.Heading
        css={css`
          flex: 1 1 0;
        `}
      >
        {selector}
      </ElementPopover.Heading>
      <Tooltip asChild content="Select child element">
        <IconButton disabled={onContract === undefined} onClick={onContract}>
          <ChevronRightIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
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
  const client = useStudioClient()

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
  }, [client, element])

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [client])

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
          tab: getTabId(),
          selector: {
            css: assertion.selector,
          },
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
              <div>{element.target.tagName.toLowerCase()}</div>
              <div>Selector</div>
              <div>{element.selector.css}</div>
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
          <ElementSelector
            selector={element.selector.css}
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
