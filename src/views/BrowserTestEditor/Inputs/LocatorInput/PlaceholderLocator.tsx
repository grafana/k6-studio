import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type PlaceholderLocator = Extract<ActionLocator, { type: 'placeholder' }>

interface PlaceholderLocatorProps {
  locator: PlaceholderLocator
  onChange: (locator: PlaceholderLocator) => void
  onBlur?: () => void
  error?: string
}

export function PlaceholderLocator({
  locator,
  onChange,
  onBlur,
  error,
}: PlaceholderLocatorProps) {
  return (
    <FieldGroup
      name="placeholder"
      label="Placeholder"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('placeholder', error)}
    >
      <TextField.Root
        size="1"
        name="placeholder"
        value={locator.placeholder}
        onChange={(e) => onChange({ ...locator, placeholder: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
