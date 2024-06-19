import { Button, Flex, TextField } from '@radix-ui/themes'
import { FormEvent, useState } from 'react'

export function GroupForm({
  onChange,
  value: savedValue,
}: {
  onChange: (value: string) => void
  value?: string
}) {
  const [value, setValue] = useState(savedValue || '')

  function handleSumbmit(e: FormEvent) {
    e.preventDefault()

    if (value.trim() === '') {
      return
    }

    onChange(value)
  }

  return (
    <Flex direction="column" width="200px" asChild>
      <form onSubmit={handleSumbmit}>
        <TextField.Root
          id="group"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          mb="2"
          placeholder="Group"
        />

        <Button disabled={value === savedValue}>Set group</Button>
      </form>
    </Flex>
  )
}
