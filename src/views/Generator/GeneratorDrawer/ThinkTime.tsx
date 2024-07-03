import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { useState } from 'react'

type Timing = 'fixed' | 'range'
type SleepType = 'groups' | 'requests' | 'iterations'

export function ThinkTime() {
  const [timing, setTiming] = useState<Timing>('fixed')
  const [sleepType, setSleepType] = useState<SleepType>('groups')
  const [fixed, setFixed] = useState<number | null>(null)
  const [min, setMin] = useState<number | null>(null)
  const [max, setMax] = useState<number | null>(null)

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMin(parseInt(e.target.value))
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMax(parseInt(e.target.value))
  }

  function handleFixedTimingChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFixed(parseInt(e.target.value))
  }

  return (
    <Box p="2" maxWidth="400px">
      <Flex gap="2" direction="column">
        <Flex direction="column" gap="1">
          <Text>Configure sleep timing</Text>
          <Flex gap="2">
            <Select.Root
              size="2"
              defaultValue="fixed"
              onValueChange={(timing: Timing) => setTiming(timing)}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="fixed">Fixed</Select.Item>
                <Select.Item value="range">Range</Select.Item>
              </Select.Content>
            </Select.Root>

            {timing === 'fixed' && (
              <TextField.Root
                size="2"
                placeholder="seconds"
                type="number"
                value={fixed || ''}
                onChange={handleFixedTimingChange}
              />
            )}

            {timing === 'range' && (
              <Flex gap="2" align="center">
                <TextField.Root
                  size="2"
                  placeholder="min"
                  type="number"
                  value={min || ''}
                  onChange={handleMinChange}
                />
                <TextField.Root
                  disabled={min === 0}
                  size="2"
                  placeholder="max"
                  type="number"
                  value={max || ''}
                  onChange={handleMaxChange}
                />
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex direction="column" gap="1">
          <Text>When do you want to add sleep?</Text>
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
          <Callout.Root color="amber">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              You should not use this option if you have included groups, as
              this may result in unexpected delays between requests, even within
              a group.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Box>
  )
}
