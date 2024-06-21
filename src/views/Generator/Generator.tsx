import { GroupedProxyData } from '@/types'
import { Button, Flex, Heading, TextField } from '@radix-ui/themes'
import { exportScript } from './Generator.utils'
import { useState } from 'react'

type Props = {
  requests: GroupedProxyData
}

export function Generator({ requests }: Props) {
  const [filter, setFilter] = useState('')

  if (Object.entries(requests).length === 0) {
    return null
  }

  const handleExport = () => {
    exportScript(
      requests,
      [
        {
          type: 'customCode',
          filter: { path: '' },
          snippet: 'console.log("Hello, world!")',
          placement: 'before',
        },
      ],
      [filter]
    )
  }

  return (
    <>
      <Heading my="4">Generator</Heading>
      <Flex justify="between" align="center" gap="2">
        <TextField.Root
          id="group"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Allow requests containing..."
        />
        <Button onClick={handleExport}>Export script</Button>
      </Flex>
    </>
  )
}
