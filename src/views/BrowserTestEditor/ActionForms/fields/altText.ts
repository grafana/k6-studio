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
  getValue: (locator: Extract<ActionLocator, { type: 'alt' }>) => locator.text,
  setValue: (
    locator: Extract<ActionLocator, { type: 'alt' }>,
    value: string
  ) => ({
    ...locator,
    text: value,
  }),
  validate: required('Alt text cannot be empty'),
})
