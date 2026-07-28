import { css, keyframes } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import {
  ChevronRightIcon,
  CornerDownRightIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'

import {
  getLocatorPlainText,
  LocatorSummary,
} from '@/components/Browser/Locator'
import {
  ElementLocatorOptions,
  frameLocatorOptions,
  getCurrentLocator,
  LocatorOptions,
} from '@/schemas/locator'
import { flattenLocators, unflattenLocators } from '@/utils/locator'
import { SyntheticKey } from '@/utils/zod'

import { LocatorEditor } from './LocatorEditor'
import { TouchState, TouchStates } from './LocatorForm.hooks'
import { validateLocator } from './locators/validation'

export type LocatorTargetKey = SyntheticKey

const slideDown = keyframes`
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
`

const slideUp = keyframes`
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
`

interface LocatorChainListProps {
  touchStates: TouchStates
  target: ElementLocatorOptions
  expanded: LocatorTargetKey | null
  suggestedRoles?: string[]
  onChange: (newState: ElementLocatorOptions) => void
  onHoverTarget: (target: LocatorOptions | null) => void
  onExpandedChange: (target: LocatorTargetKey | null) => void
  onTouch: (locator: LocatorOptions) => void
}

export function LocatorChainList({
  touchStates,
  target,
  expanded,
  suggestedRoles,
  onExpandedChange,
  onHoverTarget,
  onChange,
  onTouch,
}: LocatorChainListProps) {
  const handleAddFrame = () => {
    const frame = {
      ...frameLocatorOptions(),
      parent: target.parent,
    }

    onExpandedChange(frame.key)
    onChange({
      ...target,
      parent: frame,
    })
  }

  const handleRemoveFrame = (parent: LocatorOptions) => {
    if (expanded === parent.key) {
      onExpandedChange(target.key)
    }

    onChange({
      ...target,
      parent: unflattenLocators(
        flattenLocators(target.parent).filter(
          (frame) => frame.key !== parent.key
        )
      ),
    })
  }

  const handleParentChange = (newParent: LocatorOptions) => {
    onChange({
      ...target,
      parent: unflattenLocators(
        flattenLocators(target.parent).map((frame) =>
          frame.key === newParent.key ? newParent : frame
        )
      ),
    })
  }

  const parents = flattenLocators(target.parent).toArray().toReversed()

  const handleExpandedChange = (value: string) => {
    // Switching rows is the row's last chance to surface problems while
    // still in view, so mark the row being left touched even if the user
    // never blurred a field inside it.
    if (expanded !== null) {
      const leaving = [target, ...parents].find((row) => row.key === expanded)

      if (leaving) {
        onTouch(leaving)
      }
    }

    onExpandedChange(fromValue(value))
  }

  return (
    <Flex direction="column" gap="2">
      <Flex justify="end">
        <Tooltip content="Add iframe">
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            onClick={handleAddFrame}
            aria-label="Add iframe"
          >
            <PlusIcon />
          </IconButton>
        </Tooltip>
      </Flex>

      <Accordion.Root
        type="single"
        collapsible
        value={toValue(expanded)}
        onValueChange={handleExpandedChange}
      >
        {parents.map((frame, index) => (
          <LocatorChainItem
            key={frame.key}
            isSingle={false}
            touchState={touchStates.get(frame)}
            target={frame}
            label={`iframe ${index + 1}`}
            isNested={index > 0}
            onChange={handleParentChange}
            onRemove={handleRemoveFrame}
            onBlur={onTouch}
            onHover={onHoverTarget}
          />
        ))}
        <LocatorChainItem
          isSingle={parents.length === 0}
          target={target}
          touchState={touchStates.get(target)}
          label="element"
          isNested={parents.length > 0}
          suggestedRoles={suggestedRoles}
          onChange={onChange}
          onBlur={onTouch}
          onHover={onHoverTarget}
        />
      </Accordion.Root>
    </Flex>
  )
}

interface LocatorChainItemProps<Locator extends LocatorOptions> {
  isSingle: boolean
  isNested?: boolean
  touchState: TouchState
  target: Locator
  label: string
  suggestedRoles?: string[]
  onChange: (locator: Locator) => void
  onRemove?: (locator: Locator) => void
  onBlur: (locator: Locator) => void
  onHover: (target: Locator | null) => void
}

function LocatorChainItem<Locator extends LocatorOptions>({
  isSingle,
  isNested = false,
  target,
  touchState,
  label,
  suggestedRoles,
  onChange,
  onRemove,
  onBlur,
  onHover,
}: LocatorChainItemProps<Locator>) {
  const locator = getCurrentLocator(target)
  const validation = validateLocator(locator)

  const isTouched = touchState.states[target.current] ?? false

  const hasError =
    isTouched &&
    Object.values(validation[target.current] ?? {}).some(
      (value) => value !== false
    )

  const handleRemove = () => {
    onRemove?.(target)
  }

  if (isSingle) {
    // With no frames there's nothing to chain, so skip the accordion and show the
    // element's editor directly — only the add button hints that frames exist.
    return (
      <Flex px="2" pb="3">
        <LocatorEditor
          locator={target}
          isTouched={isTouched}
          fieldErrors={validation}
          suggestedRoles={suggestedRoles}
          onChange={onChange}
          onFieldBlur={onBlur}
        />
      </Flex>
    )
  }

  return (
    <Accordion.Item
      value={toValue(target.key)}
      css={css`
        border-bottom: 1px solid var(--gray-a4);
        &:last-of-type {
          border-bottom: none;
        }
      `}
    >
      <Accordion.Header asChild>
        <Flex align="center" gap="1">
          <Accordion.Trigger asChild>
            <button
              type="button"
              aria-label={`${label}: ${getLocatorPlainText(locator)}`}
              onPointerEnter={() => onHover(target)}
              onPointerLeave={() => onHover(null)}
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
                padding: var(--space-3) 0;
                cursor: pointer;
                font-size: var(--font-size-1);
                color: ${hasError ? 'var(--red-11)' : 'inherit'};
              `}
            >
              <ChevronRightIcon
                size={16}
                css={css`
                  flex-shrink: 0;
                  transition: transform 150ms ease;
                  button[data-state='open'] & {
                    transform: rotate(90deg);
                  }
                `}
              />
              {isNested && <CornerDownRightIcon size={16} />}
              <LocatorSummary locator={locator} emptyText="(empty)" />
            </button>
          </Accordion.Trigger>
          {onRemove !== undefined && (
            <Tooltip content="Remove iframe">
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                aria-label={`Remove ${label}`}
                onClick={handleRemove}
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
        <Flex px="2" pb="3">
          <LocatorEditor
            locator={target}
            isTouched={isTouched}
            fieldErrors={validation}
            suggestedRoles={suggestedRoles}
            onChange={onChange}
            onFieldBlur={onBlur}
          />
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  )
}

// Accordion values are strings; synthetic keys already are, so this just
// carries the "nothing expanded" sentinel.
const NONE = ''

function toValue(target: LocatorTargetKey | null): string {
  return target ?? NONE
}

function fromValue(value: string): LocatorTargetKey | null {
  return value === NONE ? null : (value as LocatorTargetKey)
}
