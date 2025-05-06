import { useId } from 'react'

import { FieldSet } from '@/components/primitives/FieldSet'
import { Flex } from '@/components/primitives/Flex'
import { RadioGroup } from '@/components/primitives/RadioGroup'

import { VisibilityAssertionData } from './types'

function asLiteral<T extends string>(
  keys: [...T[]],
  callback: (value: T) => void
) {
  return (value: string) => {
    if ((keys as string[]).includes(value)) {
      callback(value as T)
    }
  }
}

interface VisibilityAssertionFormProps {
  assertion: VisibilityAssertionData
  onChange: (state: VisibilityAssertionData) => void
}

export function VisibilityAssertionForm({
  assertion,
  onChange,
}: VisibilityAssertionFormProps) {
  const hiddenId = useId()
  const visibleId = useId()

  const handleValueChange = asLiteral(['visible', 'hidden'], (value) => {
    onChange({
      ...assertion,
      state: value,
    })
  })

  return (
    <Flex px="2">
      <FieldSet>
        <legend>Expected visibility:</legend>
        <RadioGroup.Root
          orientation="horizontal"
          value={assertion.state}
          onValueChange={handleValueChange}
        >
          <Flex align="center" gap="1">
            <RadioGroup.Item id={visibleId} value="visible" />
            <label htmlFor={visibleId}>Visible</label>
          </Flex>
          <Flex align="center" gap="1">
            <RadioGroup.Item id={hiddenId} value="hidden" />
            <label htmlFor={hiddenId}>Hidden</label>
          </Flex>
        </RadioGroup.Root>
      </FieldSet>
    </Flex>
  )
}
