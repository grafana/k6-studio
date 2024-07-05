import { type ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface StartTimeProps {
  value?: string
  placeholder?: string
}
export function StartTime({ value = '', placeholder = '0s' }: StartTimeProps) {
  const { setStartTime } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value)
  }

  return (
    <Flex direction="column" gap="1">
      <Label.Root>
        <Flex align="center" gap="1">
          <Label.Root>Start Time</Label.Root>

          <Tooltip
            content="Time offset since the start of the test, at which point this scenario should begin
          execution."
          >
            <InfoCircledIcon />
          </Tooltip>
        </Flex>
      </Label.Root>

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
