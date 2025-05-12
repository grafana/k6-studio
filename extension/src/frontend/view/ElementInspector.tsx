import { css } from '@emotion/react'
import { EyeOpenIcon, TextIcon } from '@radix-ui/react-icons'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SquareDashedMousePointerIcon,
} from 'lucide-react'
import { ComponentProps, useEffect, useState } from 'react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'
import { Assertion } from '@/schemas/recording'

import { client } from '../routing'

import { Anchor } from './Anchor'
import { TrackedElement, useInspectedElement } from './ElementInspector.hooks'
import { ElementPopover } from './ElementPopover'
import { Overlay } from './Overlay'
import { AssertionForm } from './assertions/AssertionForm'
import { AssertionData } from './assertions/types'
import { useEscape } from './hooks/useEscape'

function ToolbarRoot(props: ComponentProps<typeof Toolbar.Root>) {
  return (
    <Toolbar.Root
      css={css`
        display: flex;
        align-items: stretch;
      `}
      {...props}
    />
  )
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <Toolbar.Button
      {...props}
      css={css`
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: var(--studio-spacing-2);
        padding: var(--studio-spacing-2);
        font-size: var(--studio-font-size-1);
      `}
    />
  )
}

interface ElementPopoverProps {
  element: TrackedElement
  onSelectAssertion: (data: AssertionData) => void
  onSelectionDecrease?: () => void
  onSelectionIncrease?: () => void
}

function ElementMenu({
  element,
  onSelectAssertion,
  onSelectionDecrease,
  onSelectionIncrease,
}: ElementPopoverProps) {
  const handleAddVisibilityAssertion = () => {
    onSelectAssertion({
      type: 'visibility',
      selector: element.selector.css,
      state: 'visible',
    })
  }

  const handleAddTextAssertion = () => {
    onSelectAssertion({
      type: 'text',
      selector: element.selector.css,
      text: element.target.textContent ?? '',
    })
  }

  return (
    <ToolbarRoot
      size="1"
      orientation="vertical"
      css={css`
        gap: 0;
      `}
    >
      <ToolbarButton onClick={handleAddVisibilityAssertion}>
        <EyeOpenIcon /> <div>Add visibility assertion</div>
      </ToolbarButton>
      <ToolbarButton onClick={handleAddTextAssertion}>
        <TextIcon /> <div>Add text assertion</div>
      </ToolbarButton>
      <Toolbar.Separator />
      <div
        css={css`
          display: flex;
          gap: var(--studio-spacing-1);
          align-items: center;
          padding: var(--studio-spacing-1) var(--studio-spacing-2);
        `}
      >
        <div
          css={css`
            display: flex;
            gap: var(--studio-spacing-2);
            align-items: center;
            flex: 1 1 0;
          `}
        >
          <SquareDashedMousePointerIcon size={16} strokeWidth={1.5} />
          Selection
        </div>
        <Tooltip asChild content="Select parent element.">
          <div>
            <Toolbar.Button
              disabled={onSelectionIncrease === undefined}
              onClick={onSelectionIncrease}
            >
              <ChevronLeftIcon size={16} strokeWidth={1.5} />
            </Toolbar.Button>
          </div>
        </Tooltip>
        <Tooltip asChild content="Select child element.">
          <div>
            <Toolbar.Button
              disabled={onSelectionDecrease === undefined}
              onClick={onSelectionDecrease}
            >
              <ChevronRightIcon size={16} strokeWidth={1.5} />
            </Toolbar.Button>
          </div>
        </Tooltip>
      </div>
    </ToolbarRoot>
  )
}

function toAssertion(data: AssertionData): Assertion {
  switch (data.type) {
    case 'visibility':
      return {
        type: 'visibility',
        visible: data.state === 'visible',
      }

    case 'text':
      return {
        type: 'text',
        operation: {
          type: 'contains',
          value: data.text,
        },
      }
  }
}

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

  useEffect(() => {
    console.log('Pinned element', pinned?.id)
  }, [pinned?.id])

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
