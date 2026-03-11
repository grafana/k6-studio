import { Popover } from '@radix-ui/themes'
import { useState } from 'react'

import { urlField } from '../../ActionForms/fields'
import { buildFieldErrors } from '../../ActionForms/utils'
import { FieldRenderer } from '../components'
import { ValuePopoverBadge } from '../components/ValuePopoverBadge'

interface UrlFormProps {
  value: string
  onChange: (value: string) => void
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const errorMessage = isTouched ? urlField.validate?.(value) : undefined

  return (
    <Popover.Root
      open={isPopoverOpen}
      onOpenChange={(open) => {
        setIsPopoverOpen(open)
        if (!open) {
          setIsTouched(true)
        }
      }}
    >
      <Popover.Trigger>
        <ValuePopoverBadge
          displayValue={value || 'Enter URL'}
          error={errorMessage}
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="300px">
        <FieldRenderer
          field={urlField}
          model={value}
          onChange={onChange}
          onBlur={() => setIsTouched(true)}
          errors={buildFieldErrors('url', errorMessage)}
        />
      </Popover.Content>
    </Popover.Root>
  )
}
