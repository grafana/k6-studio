import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { toFieldErrors } from '../utils'

type PlaceholderLocator = Extract<ActionLocator, { type: 'placeholder' }>

interface GetByPlaceholderFormProps {
  locator: PlaceholderLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByPlaceholderForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByPlaceholderFormProps) {
  return (
    <FieldGroup
      name="placeholder"
      label="Placeholder"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('placeholder', errors?.['placeholder'])}
    >
      <TextField.Root
        size="1"
        name="placeholder"
        value={locator.placeholder}
        onChange={(e) => onChange({ ...locator, placeholder: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
