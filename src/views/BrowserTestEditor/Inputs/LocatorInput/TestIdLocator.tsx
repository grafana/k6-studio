import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type TestIdLocator = Extract<ActionLocator, { type: 'testid' }>

interface TestIdLocatorProps {
  locator: TestIdLocator
  onChange: (locator: TestIdLocator) => void
}

export function TestIdLocator({ locator, onChange }: TestIdLocatorProps) {
  return (
    <FieldGroup name="test-id" label="Test ID" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="test-id"
        value={locator.testId}
        onChange={(e) => onChange({ ...locator, testId: e.target.value })}
      />
    </FieldGroup>
  )
}
