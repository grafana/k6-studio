import { type ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface MaxDurationProps {
  value?: number | string
  placeholder?: string
  info?: string
  error?: string
}

export function MaxDuration({
  value = '',
  placeholder = '10m',
}: MaxDurationProps) {
  const { setMaxDuration } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaxDuration(event.target.value)
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center">
        <Label.Root>Max Duration</Label.Root>

        <Tooltip
          content={`Maximum scenario duration before it's forcibly stopped (excluding 'Graceful Stop').`}
        >
          <InfoCircledIcon />
        </Tooltip>
      </Flex>

      <TextField.Root
        type="number"
        min={0}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </Flex>
  )
}
