import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

export const titleField = defineField<
  string,
  Extract<ActionLocator, { type: 'title' }>
>({
  name: 'title',
  label: 'Title',
  input: 'text',
  getValue: (locator) => locator.title,
  setValue: (locator, value) => ({
    ...locator,
    title: value,
  }),
  validate: required('Title cannot be empty'),
})
