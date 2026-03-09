import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const altTextField = defineField<
  string,
  Extract<ActionLocator, { type: 'alt' }>
>({
  name: 'alt',
  label: 'Alt text',
  input: 'text',
  getValue: (locator) => locator.text,
  setValue: (locator, value) => ({
    ...locator,
    text: value,
  }),
  validate: required('Alt text cannot be empty'),
})
