import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const cssSelectorField = defineField<
  string,
  Extract<ActionLocator, { type: 'css' }>
>({
  name: 'css-selector',
  label: 'CSS selector',
  input: 'textarea',
  getValue: (locator) => locator.selector,
  setValue: (locator, value: string) => ({
    ...locator,
    selector: value,
  }),
  validate: required('CSS selector cannot be empty'),
})
