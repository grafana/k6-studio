import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type TestIdLocator = Extract<ActionLocator, { type: 'testid' }>

interface TestIdLocatorProps {
  locator: TestIdLocator
  onChange: (locator: TestIdLocator) => void
  onBlur?: () => void
  error?: string
}

export function TestIdLocator({
  locator,
  onChange,
  onBlur,
  error,
}: TestIdLocatorProps) {
  return (
    <FieldGroup
      name="test-id"
      label="Test ID"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('test-id', error)}
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
