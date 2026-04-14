import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { toFieldErrors } from '../utils'

type TestIdLocator = Extract<ActionLocator, { type: 'testid' }>

interface GetByTestIdFormProps {
  locator: TestIdLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByTestIdForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByTestIdFormProps) {
  return (
    <FieldGroup
      name="test-id"
      label="Test ID"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('test-id', errors?.['test-id'])}
    >
      <TextField.Root
        size="1"
        name="test-id"
        value={locator.testId}
        onChange={(e) => onChange({ ...locator, testId: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
