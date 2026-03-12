import { defineField } from './types'
import { composeValidators, required, validUrl } from './validation'

export const urlField = defineField<string>({
  name: 'url',
  label: 'URL',
  input: 'text',
  getValue: (url) => url,
  setValue: (_, value) => value,
  validate: composeValidators(
    required('URL cannot be empty'),
    validUrl('Invalid URL')
  ),
})
