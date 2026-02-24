import { TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type TitleLocator = Extract<ActionLocator, { type: 'title' }>

interface TitleLocatorProps {
  locator: TitleLocator
  onChange: (locator: TitleLocator) => void
}

export function TitleLocator({ locator, onChange }: TitleLocatorProps) {
  return (
    <FieldGroup name="title" label="Title" labelSize="1" mb="0">
      <TextField.Root
        size="1"
        name="title"
        value={locator.title}
        onChange={(e) => onChange({ ...locator, title: e.target.value })}
      />
    </FieldGroup>
  )
}
