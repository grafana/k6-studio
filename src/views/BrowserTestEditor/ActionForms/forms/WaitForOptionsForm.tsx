import { css } from '@emotion/react'
import {
  IconButton,
  Popover,
  Select,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useState } from 'react'

import { FieldGroup } from '@/components/Form'
import { LocatorWaitForAction } from '@/schemas/browserTest/v1'

import { toFieldErrors } from './utils'

type State = 'attached' | 'detached' | 'visible' | 'hidden'

const STATE_OPTIONS: { value: State; label: string }[] = [
  { value: 'attached', label: 'Attached' },
  { value: 'detached', label: 'Detached' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
]

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

  const timeoutError = validateTimeout(options?.timeout)

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
        <FieldGroup name="state" label="State" labelSize="1" mb="0">
          <Select.Root
            name="state"
            size="1"
            value={options?.state}
            onValueChange={(state: State) =>
              onChange({ ...(options ?? {}), state })
            }
          >
            <Select.Trigger
              placeholder="Select state"
              css={css`
                width: 100%;
              `}
            />
            <Select.Content>
              {STATE_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </FieldGroup>
        <FieldGroup
          name="timeout"
          label="Timeout (ms)"
          labelSize="1"
          mb="0"
          errors={toFieldErrors(
            'timeout',
            isTouched ? timeoutError : undefined
          )}
        >
          <TextField.Root
            size="1"
            name="timeout"
            type="number"
            placeholder="default: 30000"
            value={options?.timeout == null ? '' : String(options.timeout)}
            onChange={(e) => {
              const trimmed = e.target.value.trim()
              if (!trimmed) {
                onChange({ ...(options ?? {}), timeout: undefined })
                return
              }
              const parsed = Number(trimmed)
              onChange({
                ...(options ?? {}),
                timeout: Number.isNaN(parsed) ? undefined : parsed,
              })
            }}
            onBlur={() => setIsTouched(true)}
          />
        </FieldGroup>
      </Popover.Content>
    </Popover.Root>
  )
}

function validateTimeout(value: number | undefined) {
  if (typeof value !== 'undefined' && value < 0) return 'Timeout must be >= 0'
}
