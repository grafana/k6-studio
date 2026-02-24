import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type CssLocator = Extract<ActionLocator, { type: 'css' }>

interface CssLocatorProps {
  locator: CssLocator
  onChange: (locator: CssLocator) => void
}

export function CssLocator({ locator, onChange }: CssLocatorProps) {
  return (
    <FieldGroup name="css-selector" label="CSS selector" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="css-selector"
        value={locator.selector}
        onChange={(e) => onChange({ ...locator, selector: e.target.value })}
      />
    </FieldGroup>
  )
}
