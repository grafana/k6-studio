import { ChangeEvent, useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Input } from '@/components/primitives/Input'
import { Label } from '@/components/primitives/Label'
import { TextArea } from '@/components/primitives/TextArea'

import { AssertionForm } from './AssertionForm'
import { InputValueAssertionData } from './types'

interface InputValueAssertionProps {
  assertion: InputValueAssertionData
  onCancel: () => void
  onChange: (state: InputValueAssertionData) => void
  onSubmit: (state: InputValueAssertionData) => void
}

export function InputValueAssertionEditor({
  assertion,
  onCancel,
  onChange,
  onSubmit,
}: InputValueAssertionProps) {
  const expectedValueId = useId()

  const handleExpectedValueChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...assertion,
      expected: event.target.value,
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
        {!assertion.multiline && (
          <Input
            id={expectedValueId}
            size="1"
            value={assertion.selector}
            onChange={handleExpectedValueChange}
          />
        )}
        {assertion.multiline && (
          <TextArea
            id={expectedValueId}
            size="1"
            value={assertion.expected}
            onChange={handleExpectedValueChange}
          />
        )}
      </Flex>
    </AssertionForm>
  )
}
