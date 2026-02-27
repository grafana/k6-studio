import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type TextLocator = Extract<ActionLocator, { type: 'text' }>

interface TextLocatorProps {
  locator: TextLocator
  onChange: (locator: TextLocator) => void
  onBlur?: () => void
  error?: string
}

export function TextLocator({
  locator,
  onChange,
  onBlur,
  error,
}: TextLocatorProps) {
  return (
    <FieldGroup
      name="text-content"
      label="Text content"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('text-content', error)}
    >
      <TextField.Root
        size="1"
        name="text-content"
        value={locator.text}
        onChange={(e) => onChange({ ...locator, text: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
