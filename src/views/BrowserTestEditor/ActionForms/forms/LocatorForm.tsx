import { Flex, Popover } from '@radix-ui/themes'
import { ReactElement, useEffect, useState } from 'react'

import { LocatorSummary } from '@/components/Browser/Locator'
import {
  HighlightedLocator,
  useHighlightLocator,
} from '@/components/HighlightLocatorProvider'
import { AnyLocatableAction } from '@/schemas/browserTest/v1/actions'
import {
  getCurrentLocator,
  LocatorOptions,
  TargetLocatorOptions,
} from '@/schemas/locator'

import { ValuePopoverBadge } from '../components'

import { LocatorChainList, LocatorTargetKey } from './LocatorChainList'
import { getErrors } from './locators/validation'

interface LocatorFormProps<Action extends AnyLocatableAction> {
  action: Action
  suggestedRoles?: string[]
  onChange: (value: Action) => void
}

export function LocatorForm<Action extends AnyLocatableAction>({
  action,
  suggestedRoles,
  onChange,
}: LocatorFormProps<Action>): ReactElement {
  const highlightSelector = useHighlightLocator()

  const elementOptions = action.locator

  const [isTouched, setIsTouched] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Which accordion row is open (null = all collapsed). The open row is the one
  // being edited; frames and the element are addressed by their own synthetic key.
  const [expandedTarget, setExpandedTarget] = useState<LocatorTargetKey | null>(
    elementOptions.key
  )
  const [hoveredTarget, setHoveredTarget] = useState<LocatorTargetKey | null>(
    null
  )

  // The badge surfaces the first problem anywhere in the chain: the element
  // first, then frames outermost-first (prefixed so the tooltip says which).
  const badgeError = getErrors(elementOptions)[0]

  useEffect(() => {
    if (!isPopoverOpen) {
      highlightSelector(null)

      return
    }

    const debounce = setTimeout(() => {
      highlightSelector(
        resolveHighlight(
          hoveredTarget ?? expandedTarget ?? elementOptions.key,
          elementOptions
        )
      )
    }, 100)

    return () => {
      clearTimeout(debounce)
    }
  }, [
    isPopoverOpen,
    hoveredTarget,
    expandedTarget,
    elementOptions,
    highlightSelector,
  ])

  useEffect(() => {
    return () => {
      highlightSelector(null)
    }
  }, [highlightSelector])

  const handlePointerEnter = () => {
    highlightSelector(resolveHighlight(elementOptions.key, elementOptions))
  }

  const handlePointerLeave = () => {
    if (isPopoverOpen) {
      return
    }

    highlightSelector(null)
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)

    if (open) {
      setExpandedTarget(elementOptions.key)
      setHoveredTarget(null)

      return
    }

    setIsTouched(true)
  }

  const handleChange = (next: LocatorOptions) => {
    onChange({
      ...action,
      locator: next,
    })
  }

  const handleHoverTarget = (target: LocatorOptions | null) => {
    setHoveredTarget(target?.key ?? null)
  }

  const handleExpandedChange = (target: LocatorTargetKey | null) => {
    setExpandedTarget(target)
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <ValuePopoverBadge
          displayValue={<DisplayValue state={elementOptions} />}
          error={isTouched ? badgeError : undefined}
        />
      </Popover.Trigger>
      <Popover.Content
        align="start"
        size="1"
        width="400px"
        // Don't auto-focus the first control (the add-iframe button), which
        // would pop its tooltip open the moment the popover appears.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <LocatorChainList
          target={elementOptions}
          isTouched={isTouched}
          expanded={expandedTarget}
          suggestedRoles={suggestedRoles}
          onChange={handleChange}
          onHoverTarget={handleHoverTarget}
          onExpandedChange={handleExpandedChange}
        />
      </Popover.Content>
    </Popover.Root>
  )
}

// What hovering or editing `target` should highlight: a frame within the
// frames before it, the element within the full chain.
function resolveHighlight(
  target: LocatorTargetKey,
  element: TargetLocatorOptions
): HighlightedLocator | null {
  const chain = [element, ...element.parents]

  const index = chain.findIndex((frame) => frame.key === target)
  const [frame, ...rest] = chain.slice(index)

  if (frame === undefined) {
    return null
  }

  return {
    locator: getCurrentLocator(frame),
    frames: rest.toReversed(), // Frames should be outermost-first for the highlight provider, but the chain is innermost-first.
  }
}

function DisplayValue({ state }: { state: LocatorOptions }) {
  return (
    <Flex gap="1" align="center" overflow="hidden">
      <LocatorSummary locator={getCurrentLocator(state)} />
    </Flex>
  )
}
