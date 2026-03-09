import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const placeholderField = defineField<
  string,
  Extract<ActionLocator, { type: 'placeholder' }>
>({
  name: 'placeholder',
  label: 'Placeholder',
  input: 'text',
  getValue: (locator) => locator.placeholder,
  setValue: (locator, value) => ({
    ...locator,
    placeholder: value,
  }),
  validate: required('Placeholder cannot be empty'),
})
