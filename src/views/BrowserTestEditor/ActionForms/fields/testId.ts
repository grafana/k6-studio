import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const testIdField = defineField<
  string,
  Extract<ActionLocator, { type: 'testid' }>
>({
  name: 'test-id',
  label: 'Test ID',
  input: 'text',
  getValue: (locator) => locator.testId,
  setValue: (locator, value) => ({
    ...locator,
    testId: value,
  }),
  validate: required('Test ID cannot be empty'),
})
