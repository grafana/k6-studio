import { css } from '@emotion/react'
import { Flex, Grid, RadioGroup, Separator } from '@radix-ui/themes'
import { useState } from 'react'

import { toNodeSelector } from '@/codegen/browser/selectors'
import { LocatorIcon, LocatorText } from '@/components/Browser/Locator'
import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import type { FieldConfig } from '../../ActionForms'
import { buildFieldErrors } from '../../ActionForms/utils'
import { LocatorOptions } from '../../types'
import { FieldRenderer, FormPopover } from '../components'
import {
  altTextField,
  cssSelectorField,
  formLabelField,
  placeholderField,
  roleField,
  roleNameField,
  testIdField,
  textContentField,
  titleField,
} from '../fields'

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

const LOCATOR_FIELDS: Record<
  ActionLocator['type'],
  FieldConfig<string, ActionLocator>[]
> = {
  css: [cssSelectorField],
  testid: [testIdField],
  label: [formLabelField],
  placeholder: [placeholderField],
  title: [titleField],
  alt: [altTextField],
  text: [textContentField],
  role: [roleField, roleNameField],
}

interface LocatorFormProps {
  state: LocatorOptions
  onChange: (value: LocatorOptions) => void
}

export function LocatorForm({
  state: { current, values },
  onChange,
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
      if (prev.has(current)) {
        return prev
      }
      const next = new Set(prev)
      next.add(current)
      return next
    })
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
      return
    }

    setTouchedTypes((prev) => {
      if (prev.has(current)) {
        return prev
      }
      const next = new Set(prev)
      next.add(current)
      return next
    })
  }

  const fields = LOCATOR_FIELDS[currentLocator.type]
  const validation = touchedTypes.has(current)
    ? validateFields(currentLocator, fields)
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
        <Flex direction="column" gap="2" align="stretch">
          {fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              model={currentLocator}
              onChange={handleLocatorChange}
              onBlur={handleFieldBlur}
              errors={buildFieldErrors(
                field.name,
                validation.fieldErrors?.[field.name]
              )}
            />
          ))}
        </Flex>
      </Grid>
    </FormPopover>
  )
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
        css={css`
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        `}
      >
        <LocatorText locator={selector} />
      </span>
    </Flex>
  )
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

function validateFields(
  locator: ActionLocator,
  fields: FieldConfig<string, ActionLocator>[]
) {
  const fieldErrors: Record<string, string> = {}
  let message: string | undefined

  fields.forEach((field) => {
    if (!field.validate) {
      return
    }

    const error = field.validate(field.getValue(locator), locator)

    if (error) {
      if (!message) {
        message = error
      }

      fieldErrors[field.name] = error
    }
  })

  if (!message) {
    return { isValid: true }
  }

  return { isValid: false, message, fieldErrors }
}
