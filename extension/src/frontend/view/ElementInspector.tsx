import { css } from '@emotion/react'
import { EyeOpenIcon, TextIcon } from '@radix-ui/react-icons'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SquareDashedMousePointerIcon,
} from 'lucide-react'
import { ComponentProps, FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { Popover } from '@/components/primitives/Popover'
import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'
import { Assertion } from '@/schemas/recording'

import { client } from '../routing'

import { Anchor } from './Anchor'
import { TrackedElement, useInspectedElement } from './ElementInspector.hooks'
import { Overlay } from './Overlay'
import { AssertionForm } from './assertions/AssertionForm'
import { AssertionData } from './assertions/types'
import { useEscape } from './hooks/useEscape'
import { Position } from './types'

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
  anchor: Position
  element: TrackedElement
  onClose: () => void
  onSelectionDecrease?: () => void
  onSelectionIncrease?: () => void
}

function ElementPopover({
  anchor,
  element,
  onClose,
  onSelectionDecrease,
  onSelectionIncrease,
}: ElementPopoverProps) {
  const [assertion, setAssertion] = useState<AssertionData | null>(null)

  const handleAddVisibilityAssertion = () => {
    setAssertion({
      type: 'visibility',
      state: 'visible',
    })
  }

  const handleAddTextAssertion = () => {
    setAssertion({
      type: 'text',
      selector: element?.selector.css ?? '',
      text: element?.target.textContent ?? '',
    })
  }

  const handleAssertionSubmit = (ev: FormEvent) => {
    ev.preventDefault()

    if (element === null || assertion === null) {
      return
    }

    client.send({
      type: 'record-events',
      events: [
        {
          type: 'assert',
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          tab: '',
          selector: element.selector,
          assertion: toAssertion(assertion),
        },
      ],
    })

    onClose()
  }

  return (
    <Popover.Root open>
      <Popover.Anchor asChild>
        <Anchor position={anchor} />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={8}
          css={css`
            gap: var(--studio-spacing-1);
            padding: var(--studio-spacing-1);
            font-size: var(--studio-font-size-1);
          `}
        >
          <Popover.Arrow />
          <div
            css={css`
              align-self: stretch;
              display: flex;
              justify-content: center;
              padding: var(--studio-spacing-1);
              margin-bottom: var(--studio-spacing-1);
              min-width: 250px;
              border-bottom: 1px solid var(--studio-border-color);
            `}
          >
            <strong>{element.selector.css}</strong>
          </div>
          {assertion === null && (
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
          )}
          {assertion !== null && (
            <form
              css={css`
                display: flex;
                flex-direction: column;
                gap: var(--studio-spacing-2);
                padding: var(--studio-spacing-1);
              `}
              onSubmit={handleAssertionSubmit}
            >
              <AssertionForm assertion={assertion} onChange={setAssertion} />
              <Button
                css={css`
                  align-self: flex-end;
                `}
                type="submit"
                size="1"
              >
                Add
              </Button>
            </form>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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

interface ElementInspectorProps {
  onCancel: () => void
}

export function ElementInspector({ onCancel }: ElementInspectorProps) {
  const { pinned, element, mousePosition, unpin, expand, contract } =
    useInspectedElement()

  useEscape(() => {
    if (pinned) {
      unpin()

      return
    }

    onCancel()
  }, [pinned, onCancel])

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
      anchor={mousePosition}
      element={element}
      onSelectionDecrease={contract}
      onSelectionIncrease={expand}
      onClose={unpin}
    />
  )
}
