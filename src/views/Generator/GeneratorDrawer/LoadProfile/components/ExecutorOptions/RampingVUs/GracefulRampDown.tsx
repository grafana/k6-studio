import { ChangeEvent } from 'react'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface GracefulRampDownProps {
  value?: string
  placeholder?: string
  error?: string
}

export function GracefulRampDown({
  value = '',
  placeholder = '30s',
}: GracefulRampDownProps) {
  const { setGracefulRampDown } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGracefulRampDown(event.target.value)
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>Graceful Ramp Down</Label.Root>

        <Tooltip content="Time to wait for an already started iteration to finish before stopping it during a ramp down.">
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
