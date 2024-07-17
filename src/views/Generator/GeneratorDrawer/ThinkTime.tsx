import { InfoCircledIcon } from '@radix-ui/react-icons'
import * as Label from '@radix-ui/react-label'
import { Callout, Container, Flex, Select, TextField } from '@radix-ui/themes'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { RangeTiming, SleepType } from '@/schemas/testOptions'
import { createFixedTiming } from '@/utils/thinkTime'

type TimingType = 'fixed' | 'range'

export function ThinkTime() {
  const sleepType = useGeneratorStore((store) => store.sleepType)
  const timing = useGeneratorStore((store) => store.timing)
  const setSleepType = useGeneratorStore((store) => store.setSleepType)
  const setTiming = useGeneratorStore((store) => store.setTiming)

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timing.type === 'fixed') {
      return
    }

    setTiming(createRangeTiming(parseInt(e.target.value), timing.value.max))
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timing.type === 'fixed') {
      return
    }

    setTiming(createRangeTiming(timing.value.min, parseInt(e.target.value)))
  }

  function handleFixedTimingChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timing.type === 'range') {
      return
    }

    setTiming(createFixedTiming(parseInt(e.target.value)))
  }

  function handleTimingTypeChange(timingType: TimingType) {
    if (timingType === 'fixed') {
      setTiming(createFixedTiming())
    } else {
      setTiming(createRangeTiming())
    }
  }

  return (
    <Container align="left" size="1" p="1">
      <Flex gap="3" direction="column">
        <Flex direction="column" gap="2">
          <Label.Root>Configure timing</Label.Root>
          <Flex gap="1">
            <Select.Root
              size="2"
              defaultValue="fixed"
              onValueChange={(timingType: TimingType) =>
                handleTimingTypeChange(timingType)
              }
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="fixed">Fixed</Select.Item>
                <Select.Item value="range">Range</Select.Item>
              </Select.Content>
            </Select.Root>

            {timing.type === 'fixed' && (
              <TextField.Root
                size="2"
                placeholder="seconds"
                type="number"
                value={timing.value || ''}
                onChange={handleFixedTimingChange}
              />
            )}

            {timing.type === 'range' && (
              <Flex gap="2" align="center">
                <TextField.Root
                  size="2"
                  placeholder="min"
                  type="number"
                  value={timing.value.min || ''}
                  onChange={handleMinChange}
                />
                <TextField.Root
                  size="2"
                  placeholder="max"
                  type="number"
                  value={timing.value.max || ''}
                  onChange={handleMaxChange}
                />
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex direction="column" gap="1">
          <Label.Root>Choose where to apply timing</Label.Root>
          <Select.Root
            size="2"
            defaultValue="groups"
            value={sleepType}
            onValueChange={(value: SleepType) => setSleepType(value)}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="groups">Between Groups</Select.Item>
              <Select.Item value="requests">Between Requests</Select.Item>
              <Select.Item value="iteration">End of iteration</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        {sleepType === 'requests' && (
          <Callout.Root color="amber" role="alert" variant="surface">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text wrap="balance">
              It is advisable not to use this option if you have included
              groups, as it may cause unexpected delays between requests, even
              within a group.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Container>
  )
}

const createRangeTiming = (
  min: number | null = null,
  max: number | null = null
): RangeTiming => ({
  type: 'range',
  value: { min, max },
})
