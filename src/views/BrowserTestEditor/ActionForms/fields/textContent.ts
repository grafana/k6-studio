import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const textContentField = defineField<
  string,
  Extract<ActionLocator, { type: 'text' }>
>({
  name: 'text-content',
  label: 'Text content',
  input: 'text',
  getValue: (locator) => locator.text,
  setValue: (locator, value) => ({
    ...locator,
    text: value,
  }),
  validate: required('Text cannot be empty'),
})
