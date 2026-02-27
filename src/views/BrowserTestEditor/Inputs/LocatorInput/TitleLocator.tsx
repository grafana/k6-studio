import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type TitleLocator = Extract<ActionLocator, { type: 'title' }>

interface TitleLocatorProps {
  locator: TitleLocator
  onChange: (locator: TitleLocator) => void
  onBlur?: () => void
  error?: string
}

export function TitleLocator({
  locator,
  onChange,
  onBlur,
  error,
}: TitleLocatorProps) {
  return (
    <FieldGroup
      name="title"
      label="Title"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('title', error)}
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
