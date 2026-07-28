import { FieldGroup } from '@/components/Form'
import { ElementLocator, LabelLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByLabelFormProps {
  locator: LabelLocator | undefined
  isTouched: boolean
  errors: FieldErrors['label'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByLabelForm({
  locator = { type: 'label', label: '', options: { exact: false } },
  isTouched,
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
      errors={toFieldErrors('form-label', isTouched && errors?.label)}
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
