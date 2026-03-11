import { ActionLocator } from '@/main/runner/schema'

import { defineField } from './types'
import { required } from './validation'

const ROLE_OPTIONS = [
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'textbox',
  'searchbox',
  'combobox',
  'listbox',
  'option',
].map((role) => ({ value: role, label: role }))

export const roleField = defineField<
  string,
  Extract<ActionLocator, { type: 'role' }>
>({
  name: 'role',
  label: 'Element role',
  input: 'combobox',
  options: ROLE_OPTIONS,
  getValue: (locator) => locator.role,
  setValue: (locator, value) => ({
    ...locator,
    role: value,
  }),
  validate: required('Role cannot be empty'),
})

export const roleNameField = defineField<
  string,
  Extract<ActionLocator, { type: 'role' }>
>({
  name: 'name',
  label: 'Name (optional)',
  input: 'text',
  getValue: (locator) => locator.options?.name || '',
  setValue: (locator, value) => {
    if (value.trim()) {
      return {
        ...locator,
        options: { ...locator.options, name: value },
      }
    }

    const nextOptions = { ...locator.options }
    delete nextOptions.name

    return {
      ...locator,
      options: Object.keys(nextOptions).length ? nextOptions : undefined,
    }
  },
})
