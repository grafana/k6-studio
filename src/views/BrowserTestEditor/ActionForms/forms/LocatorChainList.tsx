import { css, keyframes } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactNode } from 'react'

import {
  getLocatorPlainText,
  LocatorSummary,
} from '@/components/Browser/Locator'
import { getCurrentLocator, LocatorOptions } from '@/schemas/locator'

export type LocatorTargetKey = number | 'element'

export interface LocatorTarget<
  Key extends LocatorTargetKey = LocatorTargetKey,
> {
  key: Key
  options: LocatorOptions
  error: string | null
}

const slideDown = keyframes`
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
`

const slideUp = keyframes`
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
`

interface LocatorChainListProps {
  frames: Array<LocatorTarget<number>>
  element: LocatorTarget<'element'>
  expanded: LocatorTargetKey | null
  onExpandedChange: (target: LocatorTargetKey | null) => void
  onHoverTarget: (target: LocatorTargetKey | null) => void
  onAddFrame: () => void
  onRemoveFrame: (key: number) => void
  renderEditor: (target: LocatorTarget) => ReactNode
}

/**
 * The frame chain (outermost first) and the element, as a single-open
 * accordion. Each row's header summarizes its locator; expanding a row reveals
 * its editor inline. Frames can be removed and new ones added; the element is
 * always present.
 */
export function LocatorChainList({
  frames,
  element,
  expanded,
  onExpandedChange,
  onHoverTarget,
  onAddFrame,
  onRemoveFrame,
  renderEditor,
}: LocatorChainListProps) {
  const addButton = (
    <Flex justify="end">
      <Tooltip content="Add iframe">
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          onClick={onAddFrame}
          aria-label="Add iframe"
        >
          <PlusIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )

  // With no frames there's nothing to chain, so skip the accordion and show the
  // element's editor directly — only the add button hints that frames exist.
  if (frames.length === 0) {
    return (
      <Flex direction="column" gap="2">
        {addButton}
        {renderEditor(element)}
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="2">
      {addButton}

      <Accordion.Root
        type="single"
        collapsible
        value={toValue(expanded)}
        onValueChange={(value) => onExpandedChange(fromValue(value))}
      >
        {frames.map((frame, index) => (
          <ChainRow
            key={frame.key}
            target={frame}
            label={`iframe ${index + 1}`}
            isOpen={expanded === frame.key}
            divider
            onRemove={() => onRemoveFrame(frame.key)}
            onHoverTarget={onHoverTarget}
            renderEditor={renderEditor}
          />
        ))}
        <ChainRow
          target={element}
          label="element"
          isOpen={expanded === 'element'}
          onHoverTarget={onHoverTarget}
          renderEditor={renderEditor}
        />
      </Accordion.Root>
    </Flex>
  )
}

interface ChainRowProps {
  target: LocatorTarget
  label: string
  isOpen: boolean
  divider?: boolean
  onRemove?: () => void
  onHoverTarget: (target: LocatorTargetKey | null) => void
  renderEditor: (target: LocatorTarget) => ReactNode
}

function ChainRow({
  target,
  label,
  isOpen,
  divider = false,
  onRemove,
  onHoverTarget,
  renderEditor,
}: ChainRowProps) {
  const locator = getCurrentLocator(target.options)

  return (
    <Accordion.Item value={toValue(target.key)}>
      <Accordion.Header asChild>
        <Flex
          align="center"
          gap="1"
          css={
            divider ? { borderBottom: '1px solid var(--gray-a4)' } : undefined
          }
        >
          <Accordion.Trigger asChild>
            <button
              type="button"
              aria-label={`${label}: ${getLocatorPlainText(locator)}`}
              onPointerEnter={() => onHoverTarget(target.key)}
              onPointerLeave={() => onHoverTarget(null)}
              css={css`
                appearance: none;
                background: transparent;
                border: none;
                text-align: left;
                display: flex;
                flex: 1;
                align-items: center;
                gap: var(--space-1);
                min-width: 0;
                padding: var(--space-1) 0;
                cursor: pointer;
                font-size: var(--font-size-1);
                color: ${target.error ? 'var(--red-11)' : 'inherit'};
              `}
            >
              <ChevronDownIcon
                size={16}
                css={css`
                  flex-shrink: 0;
                  transition: transform 150ms ease;
                  button[data-state='open'] & {
                    transform: rotate(180deg);
                  }
                `}
              />
              <LocatorSummary locator={locator} emptyText="(empty)" />
            </button>
          </Accordion.Trigger>
          {onRemove !== undefined && (
            <Tooltip content="Remove iframe">
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={onRemove}
                aria-label={`Remove ${label}`}
              >
                <Trash2Icon />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      </Accordion.Header>
      <Accordion.Content
        css={css`
          overflow: hidden;
          &[data-state='open'] {
            animation: ${slideDown} 150ms ease-out;
          }
          &[data-state='closed'] {
            animation: ${slideUp} 150ms ease-out;
          }
        `}
      >
        <Flex pt="2" pb="1">
          {isOpen ? renderEditor(target) : null}
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  )
}

// Accordion values are strings; map the element/frame keys onto them.
const NONE = ''

function toValue(target: LocatorTargetKey | null): string {
  return target === null ? NONE : String(target)
}

function fromValue(value: string): LocatorTargetKey | null {
  if (value === NONE) {
    return null
  }

  return value === 'element' ? 'element' : Number(value)
}
