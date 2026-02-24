import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type PlaceholderLocator = Extract<ActionLocator, { type: 'placeholder' }>

interface PlaceholderLocatorProps {
  locator: PlaceholderLocator
  onChange: (locator: PlaceholderLocator) => void
}

export function PlaceholderLocator({
  locator,
  onChange,
}: PlaceholderLocatorProps) {
  return (
    <FieldGroup name="placeholder" label="Placeholder" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="placeholder"
        value={locator.placeholder}
        onChange={(e) => onChange({ ...locator, placeholder: e.target.value })}
      />
    </FieldGroup>
  )
}
