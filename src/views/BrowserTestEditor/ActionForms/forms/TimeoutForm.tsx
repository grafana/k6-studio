import { Popover, TextField } from '@radix-ui/themes'
import { useState } from 'react'

import { FieldGroup } from '@/components/Form'

import { ValuePopoverBadge } from '../components'

import { toFieldErrors } from './utils'

interface TimeoutForm {
  timeout: number
  onChange: (timeout: number) => void
}

export function TimeoutForm({ timeout, onChange }: TimeoutForm) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const error = validateTimeout(timeout)

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
          displayValue={
            <>{isNaN(timeout) ? 'Enter a timeout' : `${timeout} ms`}</>
          }
          error={error}
        />
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="300px">
        <FieldGroup
          name="timeout"
          label="Timeout (ms)"
          labelSize="1"
          mb="0"
          errors={toFieldErrors('timeout', isTouched ? error : undefined)}
        >
          <TextField.Root
            size="1"
            name="timeout"
            type="number"
            min={0}
            value={isNaN(timeout) ? '' : timeout}
            onChange={(e) => {
              const trimmed = e.target.value.trim()

              if (!trimmed) {
                onChange(NaN)

                return
              }

              onChange(Number(trimmed))
            }}
            onBlur={() => setIsTouched(true)}
          />
        </FieldGroup>
      </Popover.Content>
    </Popover.Root>
  )
}

function validateTimeout(value: number) {
  if (isNaN(value)) {
    return 'Timeout must be a number'
  }

  if (value < 0) {
    return 'Timeout must be >= 0'
  }
}
