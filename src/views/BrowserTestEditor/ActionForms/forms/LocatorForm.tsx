import { css } from '@emotion/react'
import {
  Flex,
  Grid,
  Popover,
  RadioGroup,
  Separator,
  Tooltip,
} from '@radix-ui/themes'
import { WholeWordIcon } from 'lucide-react'
import { useState } from 'react'

import { toNodeSelector } from '@/codegen/browser/selectors'
import { LocatorIcon, LocatorText } from '@/components/Browser/Locator'
import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'
import { NodeSelector } from '@/schemas/selectors'
import { exhaustive } from '@/utils/typescript'

import { LocatorOptions } from '../../types'
import { ValuePopoverBadge } from '../components'

import {
  GetByAltTextForm,
  GetByCssForm,
  GetByLabelForm,
  GetByPlaceholderForm,
  GetByRoleForm,
  GetByTestIdForm,
  GetByTextForm,
  GetByTitleForm,
} from './locators'

const LOCATOR_TYPES: Record<ActionLocator['type'], string> = {
  role: 'ARIA Role',
  label: 'Form label',
  alt: 'Alt text',
  placeholder: 'Placeholder',
  testid: 'Test ID',
  text: 'Text content',
  title: 'Title',
  css: 'CSS selector',
}

interface LocatorFormProps {
  state: LocatorOptions
  onChange: (value: LocatorOptions) => void
  suggestedRoles?: string[]
}

export function LocatorForm({
  state: { current, values },
  onChange,
  suggestedRoles,
}: LocatorFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [touchedTypes, setTouchedTypes] = useState(
    new Set<ActionLocator['type']>()
  )
  const [dirtyTypes, setDirtyTypes] = useState(new Set<ActionLocator['type']>())

  const currentLocator = values[current] ?? initializeLocatorValues(current)

  const handleChangeCurrent = (type: LocatorOptions['current']) => {
    if (dirtyTypes.has(current)) {
      setTouchedTypes((prev) => {
        if (prev.has(current)) {
          return prev
        }
        const next = new Set(prev)
        next.add(current)
        return next
      })
    }
    const nextValues = values[type]
      ? values
      : { ...values, [type]: initializeLocatorValues(type) }
    onChange({ current: type, values: nextValues })
  }

  const handleLocatorChange = (locator: ActionLocator) => {
    setDirtyTypes((prev) => {
      return addIfAbsent(prev, current)
    })
    onChange({
      current,
      values: { ...values, [current]: locator },
    })
  }

  const handleFieldBlur = () => {
    setTouchedTypes((prev) => {
      return addIfAbsent(prev, current)
    })
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (open) {
      return
    }

    setTouchedTypes((prev) => {
      return addIfAbsent(prev, current)
    })
  }

  const validation = touchedTypes.has(current)
    ? validateLocator(currentLocator)
    : { isValid: true }
  const error = validation.isValid ? null : validation.message

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger>
        <ValuePopoverBadge
          displayValue={<DisplayValue state={{ current, values }} />}
          error={error}
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="400px">
        <Grid gap="3" columns="auto auto 1fr">
          <FieldGroup name="locator-type" label="Get by" labelSize="1" mb="0">
            <RadioGroup.Root
              size="1"
              name="locator-type"
              value={current}
              onValueChange={handleChangeCurrent}
            >
              {Object.entries(LOCATOR_TYPES)
                // TODO: temporarily hide 'text' until codegen support is added
                .filter(([type]) => type !== 'text')
                .map(([type, label]) => (
                  <RadioGroup.Item value={type} key={type}>
                    {label}
                  </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
          </FieldGroup>

          <Separator orientation="vertical" size="4" decorative />
          <LocatorFieldsForm
            locator={currentLocator}
            errors={validation.fieldErrors}
            onChange={handleLocatorChange}
            onBlur={handleFieldBlur}
            suggestedRoles={suggestedRoles}
          />
        </Grid>
      </Popover.Content>
    </Popover.Root>
  )
}

interface LocatorFieldsFormProps {
  locator: ActionLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
  suggestedRoles?: string[]
}

function LocatorFieldsForm({
  locator,
  errors,
  onChange,
  onBlur,
  suggestedRoles,
}: LocatorFieldsFormProps) {
  switch (locator.type) {
    case 'role':
      return (
        <GetByRoleForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          suggestedRoles={suggestedRoles}
        />
      )
    case 'css':
      return (
        <GetByCssForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'testid':
      return (
        <GetByTestIdForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'label':
      return (
        <GetByLabelForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'placeholder':
      return (
        <GetByPlaceholderForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'title':
      return (
        <GetByTitleForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'alt':
      return (
        <GetByAltTextForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'text':
      return (
        <GetByTextForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    default:
      return exhaustive(locator)
  }
}

function validateLocator(locator: ActionLocator) {
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
    return { isValid: true }
  }

  return { isValid: false, message, fieldErrors }
}

function DisplayValue({
  state: { current, values },
}: {
  state: LocatorOptions
}) {
  const selector = toNodeSelector(values[current]!)
  return (
    <Flex gap="1" align="center" overflow="hidden">
      <LocatorIcon
        locator={selector}
        css={css`
          && {
            width: 12px;
            height: 12px;
            min-width: 12px;
            min-height: 12px;
          }
        `}
      />
      <span
        css={css`
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        `}
      >
        <LocatorText locator={selector} />
      </span>
      <ExactMatchIndicator locator={selector} />
    </Flex>
  )
}

function ExactMatchIndicator({ locator }: { locator: NodeSelector }) {
  if (locator.type === 'test-id' || locator.type === 'css') {
    return null
  }

  const exact =
    locator.type === 'role' ? locator.name?.exact : locator.text.exact
  if (exact) {
    return (
      <Tooltip content="Exact match">
        <WholeWordIcon aria-label="Exact match" />
      </Tooltip>
    )
  }

  return null
}

function initializeLocatorValues(type: ActionLocator['type']): ActionLocator {
  switch (type) {
    case 'css':
      return { type, selector: '' }
    case 'testid':
      return { type, testId: '' }
    case 'label':
      return { type, label: '' }
    case 'placeholder':
      return { type, placeholder: '' }
    case 'title':
      return { type, title: '' }
    case 'alt':
    case 'text':
      return { type, text: '' }
    case 'role':
      return { type, role: '' }
    default:
      return exhaustive(type)
  }
}

function addIfAbsent<T>(set: Set<T>, value: T) {
  return set.has(value) ? set : new Set(set).add(value)
}
