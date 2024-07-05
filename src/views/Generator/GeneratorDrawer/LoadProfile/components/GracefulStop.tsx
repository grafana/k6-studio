import { type ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'

import { COMMON_DEFAULTS } from '../constants'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface GracefulStopProps {
  value?: string
  placeholder?: string
}

export function GracefulStop({
  value = '',
  placeholder = COMMON_DEFAULTS.gracefulStop,
}: GracefulStopProps) {
  const { setGracefulStop } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGracefulStop(event.target.value)
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>Graceful Stop</Label.Root>

        <Tooltip content="Time to wait for iterations to finish executing before stopping them forcefully.">
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
