import { ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface StartVUsProps {
  value?: number | string
  placeholder?: string
  error?: string
}
export function StartVUs({ value = '', placeholder = '0' }: StartVUsProps) {
  const { setStartVUs } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartVUs(Number(event.target.value))
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>Start VUs</Label.Root>

        <Tooltip content="Number of VUs to run at test start.">
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
