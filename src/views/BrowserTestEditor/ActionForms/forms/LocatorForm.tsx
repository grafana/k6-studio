import { Flex, Popover } from '@radix-ui/themes'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { LocatorSummary } from '@/components/Browser/Locator'
import {
  HighlightedLocator,
  useHighlightLocator,
} from '@/components/HighlightLocatorProvider'
import {
  cssLocatorOptions,
  ElementLocator,
  getCurrentLocator,
  initializeLocatorValues,
  LocatorOptions,
} from '@/schemas/locator'
import { emptyToUndefined } from '@/utils/list'
import { exhaustive } from '@/utils/typescript'

import { useFrameChain } from '../../FrameChainContext'
import { ValuePopoverBadge } from '../components'

import {
  LocatorChainList,
  LocatorTarget,
  LocatorTargetKey,
} from './LocatorChainList'
import { LocatorEditor } from './LocatorEditor'

interface LocatorFormProps {
  state: LocatorOptions
  onChange: (value: LocatorOptions) => void
  suggestedRoles?: string[]
}

export function LocatorForm({
  state: { current, values },
  onChange,
  suggestedRoles,
}: LocatorFormProps): ReactElement {
  const highlightSelector = useHighlightLocator()
  const { frames, onChange: onChangeFrames } = useFrameChain()

  const chain = frames ?? []
  const elementOptions: LocatorOptions = { current, values }

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Stable key per frame. Index keys would shift when a non-last frame is
  // removed, reassigning expansion and validation state to a different frame.
  // The keys are maintained alongside add/remove, which are the only ways the
  // chain length changes while the popover is open.
  const nextKey = useRef(chain.length)
  const [frameKeys, setFrameKeys] = useState<number[]>(() =>
    chain.map((_, index) => index)
  )
  const frameKeyAt = (index: number) => frameKeys[index] ?? index

  // Which accordion row is open (null = all collapsed). The open row is the one
  // being edited; frames are addressed by their stable key.
  const [expandedTarget, setExpandedTarget] = useState<LocatorTargetKey | null>(
    'element'
  )
  const [hoveredTarget, setHoveredTarget] = useState<LocatorTargetKey | null>(
    null
  )

  const [touchedTypes, setTouchedTypes] = useState(
    new Map<LocatorTargetKey, Set<ElementLocator['type']>>()
  )
  const [dirtyTypes, setDirtyTypes] = useState(
    new Map<LocatorTargetKey, Set<ElementLocator['type']>>()
  )

  const optionsFor = (key: LocatorTargetKey): LocatorOptions => {
    if (key === 'element') {
      return elementOptions
    }

    return chain[frameKeys.indexOf(key)] ?? elementOptions
  }

  const getTargetValidation = (
    key: LocatorTargetKey,
    options: LocatorOptions
  ) => {
    if (!touchedTypes.get(key)?.has(options.current)) {
      return { isValid: true as const }
    }

    return validateLocator(getCurrentLocator(options))
  }

  const toTarget = <Key extends LocatorTargetKey>(
    key: Key,
    options: LocatorOptions
  ): LocatorTarget<Key> => {
    const validation = getTargetValidation(key, options)

    return {
      key,
      options,
      error: validation.isValid ? null : (validation.message ?? null),
    }
  }

  const frameTargets = chain.map((frame, index) =>
    toTarget(frameKeyAt(index), frame)
  )
  const elementTarget = toTarget('element', elementOptions)

  // The badge surfaces the first problem anywhere in the chain: the element
  // first, then frames outermost-first (prefixed so the tooltip says which).
  const badgeError =
    elementTarget.error ??
    frameTargets
      .map((target, index) =>
        target.error !== null ? `iframe ${index + 1}: ${target.error}` : null
      )
      .find((message) => message !== null) ??
    null

  useEffect(() => {
    if (!isPopoverOpen) {
      highlightSelector(null)

      return
    }

    const debounce = setTimeout(() => {
      highlightSelector(
        resolveHighlight(
          hoveredTarget ?? expandedTarget ?? 'element',
          frameKeys,
          frames,
          { current, values }
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
    current,
    values,
    frames,
    frameKeys,
    highlightSelector,
  ])

  useEffect(() => {
    return () => {
      highlightSelector(null)
    }
  }, [highlightSelector])

  const handlePointerEnter = () => {
    highlightSelector(
      resolveHighlight('element', frameKeys, frames, elementOptions)
    )
  }

  const handlePointerLeave = () => {
    if (isPopoverOpen) {
      return
    }

    highlightSelector(null)
  }

  const updateTarget = (key: LocatorTargetKey, value: LocatorOptions) => {
    if (key === 'element') {
      onChange(value)

      return
    }

    const index = frameKeys.indexOf(key)

    onChangeFrames?.(
      chain.map((frame, position) => (position === index ? value : frame))
    )
  }

  // Editing a type and moving on (switching type, collapsing, or closing) marks
  // it touched so validation only surfaces for fields the user actually
  // visited.
  const promoteDirtyToTouched = (key: LocatorTargetKey) => {
    const options = optionsFor(key)

    if (dirtyTypes.get(key)?.has(options.current)) {
      setTouchedTypes((prev) => addTypeToMap(prev, key, options.current))
    }
  }

  const handleTypeChange = (
    target: LocatorTarget,
    type: LocatorOptions['current']
  ) => {
    promoteDirtyToTouched(target.key)

    const nextValues = target.options.values[type]
      ? target.options.values
      : { ...target.options.values, [type]: initializeLocatorValues(type) }

    updateTarget(target.key, { current: type, values: nextValues })
  }

  const handleLocatorChange = (
    target: LocatorTarget,
    locator: ElementLocator
  ) => {
    setDirtyTypes((prev) =>
      addTypeToMap(prev, target.key, target.options.current)
    )
    updateTarget(target.key, {
      current: target.options.current,
      values: {
        ...target.options.values,
        [target.options.current]: locator,
      },
    })
  }

  const handleFieldBlur = (target: LocatorTarget) => {
    setTouchedTypes((prev) =>
      addTypeToMap(prev, target.key, target.options.current)
    )
  }

  const handleExpandedChange = (next: LocatorTargetKey | null) => {
    if (expandedTarget !== null) {
      promoteDirtyToTouched(expandedTarget)
    }

    setExpandedTarget(next)
  }

  const handleAddFrame = () => {
    const key = nextKey.current++

    setFrameKeys((prev) => [key, ...prev])
    setExpandedTarget(key)
    onChangeFrames?.([cssLocatorOptions(''), ...chain])
  }

  const handleRemoveFrame = (key: number) => {
    const index = frameKeys.indexOf(key)

    setFrameKeys((prev) => prev.filter((existing) => existing !== key))
    setTouchedTypes((prev) => deleteFromMap(prev, key))
    setDirtyTypes((prev) => deleteFromMap(prev, key))

    if (expandedTarget === key) {
      setExpandedTarget('element')
    }

    onChangeFrames?.(
      emptyToUndefined(chain.filter((_, position) => position !== index))
    )
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)

    if (open) {
      setExpandedTarget('element')
      setHoveredTarget(null)

      return
    }

    // Closing is the last chance to surface problems, so mark the current type
    // of every target (element and frames) touched — including never-visited
    // frames, whose errors then show on the badge.
    setTouchedTypes((prev) => {
      return chain.reduce(
        (next, frame, index) =>
          addTypeToMap(next, frameKeyAt(index), frame.current),
        addTypeToMap(prev, 'element', current)
      )
    })
  }

  const renderEditor = (target: LocatorTarget): ReactNode => {
    const validation = getTargetValidation(target.key, target.options)

    return (
      <LocatorEditor
        state={target.options}
        fieldErrors={validation.isValid ? undefined : validation.fieldErrors}
        suggestedRoles={target.key === 'element' ? suggestedRoles : undefined}
        onTypeChange={(type) => handleTypeChange(target, type)}
        onLocatorChange={(locator) => handleLocatorChange(target, locator)}
        onFieldBlur={() => handleFieldBlur(target)}
      />
    )
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <ValuePopoverBadge
          displayValue={<DisplayValue state={elementOptions} />}
          error={badgeError}
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
        {onChangeFrames === undefined ? (
          renderEditor(elementTarget)
        ) : (
          <LocatorChainList
            frames={frameTargets}
            element={elementTarget}
            expanded={expandedTarget}
            onExpandedChange={handleExpandedChange}
            onHoverTarget={setHoveredTarget}
            onAddFrame={handleAddFrame}
            onRemoveFrame={handleRemoveFrame}
            renderEditor={renderEditor}
          />
        )}
      </Popover.Content>
    </Popover.Root>
  )
}

// What hovering or editing `target` should highlight: a frame within the
// frames before it, the element within the full chain.
function resolveHighlight(
  target: LocatorTargetKey,
  frameKeys: number[],
  frames: LocatorOptions[] | undefined,
  element: LocatorOptions
): HighlightedLocator {
  const chain = frames ?? []

  if (target !== 'element') {
    const index = frameKeys.indexOf(target)
    const frame = chain[index]

    if (frame !== undefined) {
      return {
        locator: getCurrentLocator(frame),
        frames: chain.slice(0, index),
      }
    }
  }

  return { locator: getCurrentLocator(element), frames }
}

function validateLocator(locator: ElementLocator) {
  const fieldErrors: Record<string, string> = {}

  switch (locator.type) {
    case 'css':
      if (!locator.selector.trim())
        fieldErrors['css-selector'] = 'CSS selector cannot be empty'
      break
    case 'testid':
      if (!locator.testId.trim())
        fieldErrors['test-id'] = 'Test ID cannot be empty'
      break
    case 'label':
      if (!locator.label.trim())
        fieldErrors['form-label'] = 'Label cannot be empty'
      break
    case 'placeholder':
      if (!locator.placeholder.trim())
        fieldErrors['placeholder'] = 'Placeholder cannot be empty'
      break
    case 'title':
      if (!locator.title.trim()) fieldErrors['title'] = 'Title cannot be empty'
      break
    case 'alt':
    case 'text':
      if (!locator.text.trim())
        fieldErrors[locator.type === 'alt' ? 'alt' : 'text-content'] =
          locator.type === 'alt'
            ? 'Alt text cannot be empty'
            : 'Text cannot be empty'
      break
    case 'role':
      if (!locator.role.trim()) fieldErrors['role'] = 'Role cannot be empty'
      break
    default:
      exhaustive(locator)
  }

  const message = Object.values(fieldErrors)[0]

  if (!message) {
    return { isValid: true as const }
  }

  return { isValid: false as const, message, fieldErrors }
}

function DisplayValue({ state }: { state: LocatorOptions }) {
  return (
    <Flex gap="1" align="center" overflow="hidden">
      <LocatorSummary locator={getCurrentLocator(state)} />
    </Flex>
  )
}

function addTypeToMap(
  map: Map<LocatorTargetKey, Set<ElementLocator['type']>>,
  key: LocatorTargetKey,
  type: ElementLocator['type']
) {
  const existing = map.get(key)

  if (existing?.has(type)) {
    return map
  }

  return new Map(map).set(key, new Set(existing).add(type))
}

function deleteFromMap(
  map: Map<LocatorTargetKey, Set<ElementLocator['type']>>,
  key: LocatorTargetKey
) {
  if (!map.has(key)) {
    return map
  }

  const next = new Map(map)
  next.delete(key)

  return next
}
