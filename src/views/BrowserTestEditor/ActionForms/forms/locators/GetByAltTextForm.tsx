import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { toFieldErrors } from '../utils'

type AltLocator = Extract<ActionLocator, { type: 'alt' }>

interface GetByAltTextFormProps {
  locator: AltLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByAltTextForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByAltTextFormProps) {
  return (
    <FieldGroup
      name="alt"
      label="Alt text"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('alt', errors?.['alt'])}
    >
      <TextField.Root
        size="1"
        name="alt"
        value={locator.text}
        onChange={(e) => onChange({ ...locator, text: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
