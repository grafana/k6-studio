import { LocatorWaitForAction } from '@/main/runner/schema'

import { defineField } from './types'

type State = 'attached' | 'detached' | 'visible' | 'hidden'

const stateOptions: { value: State; label: string }[] = [
  { value: 'attached', label: 'Attached' },
  { value: 'detached', label: 'Detached' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
]

type OptionsModel = Partial<LocatorWaitForAction['options']> | undefined

export const stateField = defineField<State | undefined, OptionsModel>({
  name: 'state',
  label: 'State',
  input: 'select',
  placeholder: 'Select state',
  clearable: true,
  options: stateOptions,
  getValue: (model) => model?.state,
  setValue: (model, value) => ({ ...(model ?? {}), state: value }),
})
