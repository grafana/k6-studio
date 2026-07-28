import { FieldGroup } from '@/components/Form'
import { ElementLocator, TextLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByTextFormProps {
  locator: TextLocator | undefined
  isTouched: boolean
  errors: FieldErrors['text'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByTextForm({
  locator = { type: 'text', text: '', options: { exact: false } },
  isTouched,
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
      errors={toFieldErrors('text-content', isTouched && errors?.text)}
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
