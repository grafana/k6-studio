import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { toFieldErrors } from '../utils'

type TextLocator = Extract<ActionLocator, { type: 'text' }>

interface GetByTextFormProps {
  locator: TextLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByTextForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByTextFormProps) {
  return (
    <FieldGroup
      name="text-content"
      label="Text content"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('text-content', errors?.['text-content'])}
    >
      <TextField.Root
        size="1"
        name="text-content"
        value={locator.text}
        onChange={(e) => onChange({ ...locator, text: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
