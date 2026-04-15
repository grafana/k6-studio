import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { TextFieldWithExactToggle } from '../../components'
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
      <TextFieldWithExactToggle
        name="text-content"
        value={locator.text}
        exact={locator.options?.exact}
        onValueChange={(value) => onChange({ ...locator, text: value })}
        onExactChange={(exact) => {
          onChange({ ...locator, options: { ...locator.options, exact } })
        }}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
