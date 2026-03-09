import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const formLabelField = defineField<
  string,
  Extract<ActionLocator, { type: 'label' }>
>({
  name: 'form-label',
  label: 'Form label',
  input: 'text',
  getValue: (locator) => locator.label,
  setValue: (locator, value: string) => ({
    ...locator,
    label: value,
  }),
  validate: required('Label cannot be empty'),
})
