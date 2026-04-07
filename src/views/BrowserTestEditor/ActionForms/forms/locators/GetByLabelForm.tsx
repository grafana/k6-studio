import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { toFieldErrors } from '../utils'

type LabelLocator = Extract<ActionLocator, { type: 'label' }>

interface GetByLabelFormProps {
  locator: LabelLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByLabelForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByLabelFormProps) {
  return (
    <FieldGroup
      name="form-label"
      label="Form label"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('form-label', errors?.['form-label'])}
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
