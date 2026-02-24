import {
  Badge,
  Button,
  Flex,
  Grid,
  Popover,
  RadioGroup,
  Separator,
} from '@radix-ui/themes'
import { useState, useEffect } from 'react'

import { toNodeSelector } from '@/codegen/browser/selectors'
import { LocatorIcon, LocatorText } from '@/components/Browser/Locator'
import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { LocatorOptions } from '../../types'

import { AltLocator } from './AltLocator'
import { CssLocator } from './CssLocator'
import { LabelLocator } from './LabelLocator'
import { initializeLocatorValues } from './LocatorInput.utils'
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
  testid: 'Test Id',
  text: 'Text content',
  title: 'Title',
  css: 'CSS',
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
  const [localCurrent, setLocalCurrent] = useState(current)
  const [localValues, setLocalValues] = useState({ ...values })

  // Keep local state in sync if parent changes
  useEffect(() => {
    setLocalCurrent(current)
    setLocalValues({ ...values })
  }, [current, values])

  const currentLocator =
    localValues[localCurrent] ?? initializeLocatorValues(localCurrent)
  const selector = toNodeSelector(currentLocator)

  const handleChangeCurrent = (type: LocatorOptions['current']) => {
    setLocalCurrent(type)
    setLocalValues((prev) =>
      prev[type] ? prev : { ...prev, [type]: initializeLocatorValues(type) }
    )
  }

  const handleLocatorChange = (locator: ActionLocator) => {
    setLocalValues((prev) => ({ ...prev, [localCurrent]: locator }))
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (!open) {
      // Commit changes on popover close
      onChange({
        current: localCurrent,
        values: localValues,
      })
    }
  }

  const renderLocatorForm = () => {
    switch (currentLocator.type) {
      case 'css':
        return (
          <CssLocator locator={currentLocator} onChange={handleLocatorChange} />
        )
      case 'testid':
        return (
          <TestIdLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'role':
        return (
          <RoleLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'text':
        return (
          <TextLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'label':
        return (
          <LabelLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'placeholder':
        return (
          <PlaceholderLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'title':
        return (
          <TitleLocator
            locator={currentLocator}
            onChange={handleLocatorChange}
          />
        )
      case 'alt':
        return (
          <AltLocator locator={currentLocator} onChange={handleLocatorChange} />
        )
      default:
        return exhaustive(currentLocator)
    }
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger>
        <Badge color="gray" asChild>
          <Button size="1">
            <Flex gap="1">
              <LocatorIcon locator={selector} />
              {selector ? <LocatorText locator={selector} /> : 'Select locator'}
            </Flex>
          </Button>
        </Badge>
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="400px">
        <Grid gap="2" columns="auto auto 1fr">
          <FieldGroup name="locator-type" label="Get by" labelSize="1" mb="0">
            <RadioGroup.Root
              size="1"
              aria-labelledby="locator-type-label"
              value={localCurrent}
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
          <div>{renderLocatorForm()}</div>
        </Grid>
      </Popover.Content>
    </Popover.Root>
  )
}
