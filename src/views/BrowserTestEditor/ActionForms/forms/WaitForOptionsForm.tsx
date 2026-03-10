import { Tooltip } from '@radix-ui/themes'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import { LocatorWaitForAction } from '@/main/runner/schema'

import { FieldRenderer, FormPopover } from '../components'
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
    <FormPopover
      open={isPopoverOpen}
      displayValue={
        <Tooltip content="Options">
          <SlidersHorizontalIcon />
        </Tooltip>
      }
      error={isTouched ? timeoutError : null}
      onOpenChange={(open) => {
        setIsPopoverOpen(open)
        if (!open) {
          setIsTouched(true)
        }
      }}
    >
      <FieldRenderer
        field={stateField}
        model={options}
        onChange={(nextOptions) => onChange(nextOptions)}
        onBlur={() => setIsTouched(true)}
      />
      <FieldRenderer
        field={timeoutField}
        model={options}
        errors={buildFieldErrors('timeout', timeoutError)}
        onChange={(nextOptions) => onChange(nextOptions)}
        onBlur={() => setIsTouched(true)}
      />
    </FormPopover>
  )
}
