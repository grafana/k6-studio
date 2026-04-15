import { Popover, TextArea } from '@radix-ui/themes'
import { useState } from 'react'

import { FieldGroup } from '@/components/Form'

import { ValuePopoverBadge } from '../components'

interface FillValueFormProps {
  value: string
  onChange: (value: string) => void
}

export function FillValueForm({ value, onChange }: FillValueFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Trigger>
        <ValuePopoverBadge displayValue={`"${value}"`} />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="300px">
        <FieldGroup name="value" label="Value" labelSize="1" mb="0">
          <TextArea
            size="1"
            name="value"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </FieldGroup>
      </Popover.Content>
    </Popover.Root>
  )
}
