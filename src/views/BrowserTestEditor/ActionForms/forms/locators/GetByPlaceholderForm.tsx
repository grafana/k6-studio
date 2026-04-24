import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
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
      <TextFieldWithExactToggle
        name="placeholder"
        value={locator.placeholder}
        exact={locator.options?.exact}
        onValueChange={(value) => onChange({ ...locator, placeholder: value })}
        onExactChange={(exact) => {
          onChange({ ...locator, options: { ...locator.options, exact } })
        }}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
