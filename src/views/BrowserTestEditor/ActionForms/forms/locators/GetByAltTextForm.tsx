import { FieldGroup } from '@/components/Form'
import { ElementLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

type AltLocator = Extract<ElementLocator, { type: 'alt' }>

interface GetByAltTextFormProps {
  locator: AltLocator
  errors?: Record<string, string>
  onChange: (locator: ElementLocator) => void
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
