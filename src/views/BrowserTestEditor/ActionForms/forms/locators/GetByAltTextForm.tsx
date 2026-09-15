import { FieldGroup } from '@/components/Form'
import { ElementLocator, AltLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByAltTextFormProps {
  locator: AltLocator | undefined
  isTouched: boolean
  errors: FieldErrors['alt'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByAltTextForm({
  locator = { type: 'alt', text: '', options: { exact: false } },
  isTouched,
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
      errors={toFieldErrors('alt', isTouched && errors?.text)}
    >
      <TextFieldWithExactToggle
        name="alt"
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
