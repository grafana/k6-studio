import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type AltTextLocator = Extract<ActionLocator, { type: 'alt' }>

interface AltLocatorProps {
  locator: AltTextLocator
  onChange: (locator: AltTextLocator) => void
}

export function AltLocator({ locator, onChange }: AltLocatorProps) {
  return (
    <FieldGroup name="alt-text" label="Alt text" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="alt-text"
        value={locator.text}
        onChange={(e) => onChange({ ...locator, text: e.target.value })}
      />
    </FieldGroup>
  )
}
