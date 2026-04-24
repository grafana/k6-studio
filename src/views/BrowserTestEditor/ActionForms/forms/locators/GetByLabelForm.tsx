import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
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
      <TextFieldWithExactToggle
        name="form-label"
        value={locator.label}
        exact={locator.options?.exact}
        onValueChange={(value) => onChange({ ...locator, label: value })}
        onExactChange={(exact) => {
          onChange({ ...locator, options: { ...locator.options, exact } })
        }}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
