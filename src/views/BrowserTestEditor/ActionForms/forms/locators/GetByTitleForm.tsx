import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/schemas/locator'

import { TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

type TitleLocator = Extract<ActionLocator, { type: 'title' }>

interface GetByTitleFormProps {
  locator: TitleLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByTitleForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByTitleFormProps) {
  return (
    <FieldGroup
      name="title"
      label="Title"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('title', errors?.['title'])}
    >
      <TextFieldWithExactToggle
        name="title"
        value={locator.title}
        exact={locator.options?.exact}
        onValueChange={(value) => onChange({ ...locator, title: value })}
        onExactChange={(exact) => {
          onChange({ ...locator, options: { ...locator.options, exact } })
        }}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
