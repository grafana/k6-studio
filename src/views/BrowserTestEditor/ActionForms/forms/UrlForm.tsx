import { Popover, TextField } from '@radix-ui/themes'
import { useState } from 'react'

import { FieldGroup } from '@/components/Form'

import { ValuePopoverBadge } from '../components'

import { toFieldErrors } from './utils'

interface UrlFormProps {
  value: string
  onChange: (value: string) => void
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const errorMessage = isTouched ? validateUrl(value) : undefined

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
        <FieldGroup
          name="url"
          label="URL"
          labelSize="1"
          mb="0"
          errors={toFieldErrors('url', errorMessage)}
        >
          <TextField.Root
            size="1"
            name="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsTouched(true)}
          />
        </FieldGroup>
      </Popover.Content>
    </Popover.Root>
  )
}

function validateUrl(value: string) {
  if (value.trim() === '') return 'URL cannot be empty'
  try {
    new URL(value)
    return undefined
  } catch {
    return 'Invalid URL'
  }
}
