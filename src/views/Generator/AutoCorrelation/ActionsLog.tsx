import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'

import { LogEntry } from './LogEntry'
import { ActionLogEntry } from './types'

interface ActionsLogProps {
  entries: ActionLogEntry[]
}

export function ActionsLog({ entries }: ActionsLogProps) {
  const [autoScroll, setAutoScroll] = useState(true)

  return (
    <AutoScrollArea
      tail={autoScroll}
      items={entries.at(-1)?.text}
      onScrollBack={() => setAutoScroll(false)}
      css={{ height: '100%' }}
    >
      <Flex direction="column" gap="1" pt="1" pb="3">
        {entries.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
      </Flex>
    </AutoScrollArea>
  )
}
