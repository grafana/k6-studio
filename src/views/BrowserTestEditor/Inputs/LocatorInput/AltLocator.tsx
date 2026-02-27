import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type AltTextLocator = Extract<ActionLocator, { type: 'alt' }>

interface AltLocatorProps {
  locator: AltTextLocator
  onChange: (locator: AltTextLocator) => void
  onBlur?: () => void
  error?: string
}

export function AltLocator({
  locator,
  onChange,
  onBlur,
  error,
}: AltLocatorProps) {
  return (
    <FieldGroup
      name="alt-text"
      label="Alt text"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('alt-text', error)}
    >
      <TextField.Root
        size="1"
        name="alt-text"
        value={locator.text}
        onChange={(e) => onChange({ ...locator, text: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
