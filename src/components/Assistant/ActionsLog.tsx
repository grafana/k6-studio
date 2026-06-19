import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'

import { LogEntry } from './LogEntry'
import { ActionLogEntry } from './types'
import { TypingDots } from './TypingDots'

interface ActionsLogProps {
  entries: ActionLogEntry[]
  /** Shows blinking dots after the last entry while the agent is streaming. */
  pending?: boolean
}

export function ActionsLog({ entries, pending = false }: ActionsLogProps) {
  const [autoScroll, setAutoScroll] = useState(true)

  return (
    <AutoScrollArea
      tail={autoScroll}
      items={`${entries.length}:${entries.at(-1)?.text}:${pending}`}
      onScrollBack={() => setAutoScroll(false)}
      css={{ height: '100%' }}
    >
      <Flex direction="column" gap="1" pt="1" pb="3">
        {entries.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
        {pending && <TypingDots />}
      </Flex>
    </AutoScrollArea>
  )
}
