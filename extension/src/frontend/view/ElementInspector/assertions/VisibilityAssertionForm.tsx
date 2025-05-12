import { useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Label } from '@/components/primitives/Label'
import { RadioGroup } from '@/components/primitives/RadioGroup'

import { AddAssertionForm } from './AddAssertionForm'
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
  onSubmit: (state: VisibilityAssertionData) => void
}

export function VisibilityAssertionForm({
  assertion,
  onChange,
  onSubmit,
}: VisibilityAssertionFormProps) {
  const labelId = useId()

  const handleValueChange = asLiteral(['visible', 'hidden'], (value) => {
    onChange({
      ...assertion,
      state: value,
    })
  })

  const handleSubmit = () => {
    onSubmit(assertion)
  }

  return (
    <AddAssertionForm onSubmit={handleSubmit}>
      <Flex direction="column" align="start" px="2" gap="2">
        <Label id={labelId} size="1">
          Expected visibility
        </Label>
        <RadioGroup.Root
          aria-labelledby={labelId}
          value={assertion.state}
          onValueChange={handleValueChange}
        >
          <Flex asChild align="center" gap="1">
            <Label size="1" weight="normal">
              <RadioGroup.Item value="visible" />
              Visible
            </Label>
          </Flex>
          <Flex asChild align="center" gap="1">
            <Label size="1" weight="normal">
              <RadioGroup.Item value="hidden" />
              Hidden
            </Label>
          </Flex>
        </RadioGroup.Root>
      </Flex>
    </AddAssertionForm>
  )
}
