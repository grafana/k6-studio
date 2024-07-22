import { Flex, Select, Tooltip } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'
import { InfoCircledIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

const EXECUTOR_LABEL_MAP: Record<
  LoadProfileExecutorOptions['executor'],
  string
> = {
  'ramping-vus': 'Ramping VUs',
  'shared-iterations': 'Shared iterations',
}

const options = Object.entries(EXECUTOR_LABEL_MAP).map(([value, label]) => ({
  label,
  value,
}))

interface ExecutorProps {
  value: LoadProfileExecutorOptions['executor']
}

export function Executor({ value = 'ramping-vus' }: ExecutorProps) {
  const { setExecutor } = useGeneratorStore()

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
        defaultValue={'ramping-vus'}
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
