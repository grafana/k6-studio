import { defineField } from './types'

type OptionsModel = { timeout?: number } | undefined

export const timeoutField = defineField<number | undefined, OptionsModel>({
  name: 'timeout',
  label: 'Timeout (ms)',
  placeholder: 'default: 30000',
  input: 'number',
  getValue: (model) => model?.timeout,
  setValue: (model, value) => ({ ...(model ?? {}), timeout: value }),
  validate: (value) =>
    typeof value !== 'undefined' && value < 0 ? 'Timeout must be >= 0' : null,
})
