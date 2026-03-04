import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type LabelLocator = Extract<ActionLocator, { type: 'label' }>

interface LabelLocatorProps {
  locator: LabelLocator
  onChange: (locator: LabelLocator) => void
  onBlur?: () => void
  error?: string
}

export function LabelLocator({
  locator,
  onChange,
  onBlur,
  error,
}: LabelLocatorProps) {
  return (
    <FieldGroup
      name="form-label"
      label="Form label"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('form-label', error)}
    >
      <TextField.Root
        size="1"
        name="form-label"
        value={locator.label}
        onChange={(e) => onChange({ ...locator, label: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
