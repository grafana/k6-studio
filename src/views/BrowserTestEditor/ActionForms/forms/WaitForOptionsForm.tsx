import { IconButton, Popover, Tooltip } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useState } from 'react'

import { LocatorWaitForAction } from '@/main/runner/schema'

import { FieldRenderer } from '../components'
import { stateField, timeoutField } from '../fields'
import { buildFieldErrors } from '../utils'

interface WaitForOptionsFormProps {
  options: LocatorWaitForAction['options']
  onChange: (options: Partial<LocatorWaitForAction['options']>) => void
}

export function WaitForOptionsForm({
  options,
  onChange,
}: WaitForOptionsFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const timeoutError = timeoutField.validate?.(options?.timeout)

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
      <Tooltip content="Options">
        <Popover.Trigger>
          <IconButton
            aria-label="Edit options"
            size="1"
            variant="ghost"
            color={timeoutError ? 'red' : 'gray'}
          >
            <SettingsIcon />
          </IconButton>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content align="start" size="1" width="300px">
        <FieldRenderer
          field={stateField}
          model={options}
          onChange={(nextOptions) => onChange(nextOptions)}
        />
        <FieldRenderer
          field={timeoutField}
          model={options}
          errors={buildFieldErrors('timeout', isTouched ? timeoutError : null)}
          onChange={(nextOptions) => onChange(nextOptions)}
          onBlur={() => setIsTouched(true)}
        />
      </Popover.Content>
    </Popover.Root>
  )
}
