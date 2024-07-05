import { ChangeEvent, useMemo } from 'react'
import { Flex, Select, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { ExecutorType } from '@/constants/generator'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

interface ExecutorProps {
  value: ExecutorType
}

export function Executor({ value = ExecutorType.RampingVUs }: ExecutorProps) {
  const { setExecutor } = useGeneratorStore()
  const options = useOptions()

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>Executor</Label.Root>

        <Tooltip content="Time to wait for an already started iteration to finish before stopping it during a ramp down.">
          <InfoCircledIcon />
        </Tooltip>
      </Flex>

      <Select.Root
        size="2"
        defaultValue={ExecutorType.RampingVUs}
        value={value}
        onValueChange={setExecutor}
      >
        <Select.Trigger />
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  )
}

const EXECUTOR_LABEL_MAP = {
  [ExecutorType.RampingVUs]: 'Ramping VUs',
  [ExecutorType.SharedIterations]: 'Shared iterations',
}

function useOptions() {
  return useMemo(() => {
    return Object.entries(EXECUTOR_LABEL_MAP).map(([value, label]) => ({
      label,
      value,
    }))
  }, [])
}
