import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type LabelLocator = Extract<ActionLocator, { type: 'label' }>

interface LabelLocatorProps {
  locator: LabelLocator
  onChange: (locator: LabelLocator) => void
}

export function LabelLocator({ locator, onChange }: LabelLocatorProps) {
  return (
    <FieldGroup name="form-label" label="Form label" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="form-label"
        value={locator.label}
        onChange={(e) => onChange({ ...locator, label: e.target.value })}
      />
    </FieldGroup>
  )
}
