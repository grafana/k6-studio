import { Badge, Button, Flex, Popover, RadioGroup } from '@radix-ui/themes'
import { useState } from 'react'

import { toNodeSelector } from '@/codegen/browser/selectors'
import { LocatorIcon, LocatorText } from '@/components/Browser/Locator'
import { Label } from '@/components/primitives/Label'
import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { LocatorOptions } from '../types'

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
  const currentLocator = values[current] ?? initializeLocatorValues(current)
  const selector = toNodeSelector(currentLocator)

  const handleChangeCurrent = (type: LocatorOptions['current']) => {
    onChange({
      current: type,
      values: values[type]
        ? values
        : { ...values, [type]: initializeLocatorValues(type) },
    })
  }

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
      <Popover.Content align="start" size="1" width="500px">
        <Flex direction="column" gap="2">
          <Label id="locator-type-label">Locator type</Label>
          <RadioGroup.Root
            size="1"
            aria-labelledby="locator-type-label"
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
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

function initializeLocatorValues(type: ActionLocator['type']): ActionLocator {
  switch (type) {
    case 'css':
      return { type, selector: 'body' }
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
      return { type, role: 'button' }
    default:
      return exhaustive(type)
  }
}
