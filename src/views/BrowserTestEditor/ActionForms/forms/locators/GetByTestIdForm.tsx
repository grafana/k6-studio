import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ElementLocator, TestIdLocator } from '@/schemas/locator'

import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByTestIdFormProps {
  locator: TestIdLocator | undefined
  isTouched: boolean
  errors: FieldErrors['testid'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByTestIdForm({
  locator = { type: 'testid', testId: '' },
  isTouched,
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
      errors={toFieldErrors('test-id', isTouched && errors?.testId)}
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
