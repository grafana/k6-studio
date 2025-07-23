import { useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Label } from '@/components/primitives/Label'
import { RadioGroup } from '@/components/primitives/RadioGroup'

import { AssertionForm } from './AssertionForm'
import { CheckAssertionData } from './types'

interface CheckAssertionEditorProps {
  assertion: CheckAssertionData
  onCancel: () => void
  onChange: (state: CheckAssertionData) => void
  onSubmit: (state: CheckAssertionData) => void
}

export function CheckAssertionEditor({
  assertion,
  onCancel,
  onChange,
  onSubmit,
}: CheckAssertionEditorProps) {
  const labelId = useId()

  const handleValueChange = (value: string) => {
    if (
      value !== 'checked' &&
      value !== 'unchecked' &&
      value !== 'indeterminate'
    ) {
      return
    }

    onChange({
      ...assertion,
      expected: value,
    })
  }

  const handleSubmit = () => {
    onSubmit(assertion)
  }

  return (
    <AssertionForm onCancel={onCancel} onSubmit={handleSubmit}>
      <Flex direction="column" align="start" px="2" gap="2">
        <Label id={labelId} size="1">
          Expected state
        </Label>
        <RadioGroup.Root
          aria-labelledby={labelId}
          value={assertion.expected}
          onValueChange={handleValueChange}
        >
          <Flex asChild align="center" gap="1">
            <Label size="1" weight="normal">
              <RadioGroup.Item value="checked" />
              Checked
            </Label>
          </Flex>
          <Flex asChild align="center" gap="1">
            <Label size="1" weight="normal">
              <RadioGroup.Item value="unchecked" />
              Unchecked
            </Label>
          </Flex>
        </RadioGroup.Root>
      </Flex>
    </AssertionForm>
  )
}
