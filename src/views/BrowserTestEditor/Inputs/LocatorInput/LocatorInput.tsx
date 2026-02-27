import { Flex, Grid, RadioGroup, Separator } from '@radix-ui/themes'
import { useState } from 'react'

import { toNodeSelector } from '@/codegen/browser/selectors'
import { LocatorIcon, LocatorText } from '@/components/Browser/Locator'
import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { LocatorOptions } from '../../types'
import { FormPopover } from '../Shared/FormPopover'

import { AltLocator } from './AltLocator'
import { CssLocator } from './CssLocator'
import { LabelLocator } from './LabelLocator'
import { initializeLocatorValues, validateLocator } from './LocatorInput.utils'
import { PlaceholderLocator } from './PlaceholderLocator'
import { RoleLocator } from './RoleLocator'
import { TestIdLocator } from './TestIdLocator'
import { TextLocator } from './TextLocator'
import { TitleLocator } from './TitleLocator'

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

interface LocatorInputProps {
  state: LocatorOptions
  onChange: (value: LocatorOptions) => void
}

export function LocatorInput({
  state: { current, values },
  onChange,
}: LocatorInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [touchedTypes, setTouchedTypes] = useState(
    new Set<ActionLocator['type']>()
  )

  const currentLocator = values[current] ?? initializeLocatorValues(current)

  const handleChangeCurrent = (type: LocatorOptions['current']) => {
    const nextValues = values[type]
      ? values
      : { ...values, [type]: initializeLocatorValues(type) }
    onChange({ current: type, values: nextValues })
  }

  const handleLocatorChange = (locator: ActionLocator) => {
    onChange({
      current,
      values: { ...values, [current]: locator },
    })
  }

  const handleFieldBlur = () => {
    setTouchedTypes((prev) => {
      if (prev.has(current)) {
        return prev
      }
      const next = new Set(prev)
      next.add(current)
      return next
    })
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (open) {
      setTouchedTypes(new Set())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePopoverOpenChange(false)
  }

  const validation = touchedTypes.has(current)
    ? validateLocator(currentLocator)
    : { isValid: true }
  const error = validation.isValid ? null : validation.message

  return (
    <FormPopover
      displayValue={<DisplayValue state={{ current, values }} />}
      error={error}
      open={isPopoverOpen}
      width="400px"
      onOpenChange={handlePopoverOpenChange}
    >
      <form onSubmit={handleSubmit}>
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
          <LocatorForm
            currentLocator={currentLocator}
            fieldErrors={validation.fieldErrors}
            onLocatorChange={handleLocatorChange}
            onBlur={handleFieldBlur}
          />
        </Grid>
      </form>
    </FormPopover>
  )
}

interface LocatorFormProps {
  currentLocator: ActionLocator
  onLocatorChange: (locator: ActionLocator) => void
  fieldErrors?: Record<string, string>
  onBlur: () => void
}

function LocatorForm({
  currentLocator,
  onLocatorChange,
  fieldErrors,
  onBlur,
}: LocatorFormProps) {
  switch (currentLocator.type) {
    case 'css':
      return (
        <CssLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.selector}
        />
      )
    case 'testid':
      return (
        <TestIdLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.testId}
        />
      )
    case 'role':
      return (
        <RoleLocator
          locator={currentLocator}
          errors={{
            role: fieldErrors?.role,
            name: fieldErrors?.name,
          }}
          onChange={onLocatorChange}
          onBlur={onBlur}
        />
      )
    case 'text':
      return (
        <TextLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.text}
        />
      )
    case 'label':
      return (
        <LabelLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.label}
        />
      )
    case 'placeholder':
      return (
        <PlaceholderLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.placeholder}
        />
      )
    case 'title':
      return (
        <TitleLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.title}
        />
      )
    case 'alt':
      return (
        <AltLocator
          locator={currentLocator}
          onChange={onLocatorChange}
          onBlur={onBlur}
          error={fieldErrors?.text}
        />
      )
    default:
      return exhaustive(currentLocator)
  }
}

function DisplayValue({
  state: { current, values },
}: {
  state: LocatorOptions
}) {
  const selector = toNodeSelector(values[current]!)
  return (
    <Flex gap="1" align="center" overflow="hidden">
      <LocatorIcon locator={selector} />
      <span
        css={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <LocatorText locator={selector} />
      </span>
    </Flex>
  )
}
