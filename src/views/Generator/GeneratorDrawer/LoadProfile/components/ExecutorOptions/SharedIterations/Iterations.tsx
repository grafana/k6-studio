import { type ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/store/generator'

interface IterationsProps {
  value?: number | string
  placeholder?: string
  info?: string
  error?: string
}

export function Iterations({
  value = '',
  placeholder = '1',
  info = 'Total number of script iterations to execute across all VUs.',
}: IterationsProps) {
  const { setIterations } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIterations(Number(event.target.value))
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>Iterations</Label.Root>

        <Tooltip content={info}>
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
