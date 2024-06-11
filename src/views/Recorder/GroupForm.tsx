import { Button, Flex, TextField, Text } from '@radix-ui/themes'
import { useState } from 'react'

export function GroupForm({
  onChange,
  value: savedValue,
}: {
  onChange: (value: string) => void
  value?: string
}) {
  const [value, setValue] = useState(savedValue || '')

  function handleSumbmit() {
    if (value.trim() === '') {
      return
    }

    onChange(value)
  }

  return (
    <Flex direction="column" width="300px" asChild>
      <form>
        <Text>Current group: {savedValue}</Text>
        <Text as="label" weight="medium" htmlFor="group">
          Group
        </Text>
        <TextField.Root
          id="group"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          mb="2"
        />

        <Button onClick={handleSumbmit} disabled={value === savedValue}>
          Set group
        </Button>
      </form>
    </Flex>
  )
}
