import { FieldGroup } from '@/components/Form'
import { ElementLocator, PlaceholderLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByPlaceholderFormProps {
  locator: PlaceholderLocator | undefined
  isTouched: boolean
  errors: FieldErrors['placeholder'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByPlaceholderForm({
  locator = { type: 'placeholder', placeholder: '', options: { exact: false } },
  isTouched,
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
      errors={toFieldErrors('placeholder', isTouched && errors?.placeholder)}
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
