import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

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
      <TextField.Root
        size="1"
        name="title"
        value={locator.title}
        onChange={(e) => onChange({ ...locator, title: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
