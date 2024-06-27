import * as Label from '@radix-ui/react-label'
import { Box, Button, Flex, TextField } from '@radix-ui/themes'
import { useState } from 'react'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'

export function RequestFilters() {
  const [newFilter, setNewFilter] = useState('')
  const { requestFilters, addRequestFilter } = useGeneratorStore()

  return (
    <Box p="2">
      <Flex gap="2" p="2" align="center" width="100%">
        <Label.Root htmlFor="requestFilterInput">
          Allow requests containing
        </Label.Root>
        <TextField.Root
          style={{ flex: 1 }}
          id="requestFilterInput"
          value={newFilter}
          onChange={(e) => setNewFilter(e.target.value)}
          placeholder="Type part of the request URL to filter requests"
        />
        <Button
          onClick={() => {
            addRequestFilter(newFilter)
          }}
        >
          Add
        </Button>
      </Flex>
      <ul>
        {requestFilters.map((filter) => (
          <li key={filter}>{filter}</li>
        ))}
      </ul>
    </Box>
  )
}
