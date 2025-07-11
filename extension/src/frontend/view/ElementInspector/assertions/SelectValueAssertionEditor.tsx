import { useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Label } from '@/components/primitives/Label'
import { Select } from '@/components/primitives/Select'

import { AssertionForm } from './AssertionForm'
import { SelectValueAssertionData } from './types'

interface SelectValueAssertionProps {
  assertion: SelectValueAssertionData
  onCancel: () => void
  onChange: (state: SelectValueAssertionData) => void
  onSubmit: (state: SelectValueAssertionData) => void
}

export function SelectValueAssertionEditor({
  assertion,
  onCancel,
  onChange,
  onSubmit,
}: SelectValueAssertionProps) {
  const expectedValueId = useId()

  const handleExpectedValueChange = (value: string) => {
    const option = assertion.options.find((option) => option.value === value)

    if (option === undefined) {
      return
    }

    onChange({
      ...assertion,
      expected: [option],
    })
  }

  const handleSubmit = () => {
    onSubmit(assertion)
  }

  return (
    <AssertionForm onCancel={onCancel} onSubmit={handleSubmit}>
      <Flex direction="column" align="stretch" gap="1">
        <Label htmlFor={expectedValueId} size="1">
          Expected value
        </Label>
        <Select.Root
          open
          value={assertion.expected[0].value}
          onValueChange={handleExpectedValueChange}
        >
          <Select.Trigger id={expectedValueId} size="1">
            {assertion.expected[0].label}
          </Select.Trigger>
          <Select.Portal>
            <Select.Content>
              {assertion.options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </Flex>
    </AssertionForm>
  )
}
