import { Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'

import { LogEntry } from './LogEntry'
import { ActionLogEntry } from './types'
import { TypingDots } from './TypingDots'

/** Delay before the dots appear, so they only show during a streaming pause. */
const DOTS_DELAY_MS = 500

interface ActionsLogProps {
  entries: ActionLogEntry[]
  /** Shows blinking dots after a streaming pause while the agent is running. */
  pending?: boolean
}

export function ActionsLog({ entries, pending = false }: ActionsLogProps) {
  const [autoScroll, setAutoScroll] = useState(true)
  const [showDots, setShowDots] = useState(false)

  // The dots appear only after the log has been quiet for a moment; any new
  // entry or streamed text resets the timer, so they signal "paused, still
  // working" rather than flickering while text streams in.
  const lastEntrySignature = `${entries.length}:${entries.at(-1)?.text}`

  useEffect(() => {
    if (!pending) {
      setShowDots(false)
      return
    }

    setShowDots(false)
    const timer = setTimeout(() => setShowDots(true), DOTS_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pending, lastEntrySignature])

  return (
    <AutoScrollArea
      tail={autoScroll}
      items={`${lastEntrySignature}:${showDots}`}
      onScrollBack={() => setAutoScroll(false)}
      css={{ height: '100%' }}
    >
      <Flex direction="column" gap="1" pt="1" pb="3">
        {entries.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
        {showDots && <TypingDots />}
      </Flex>
    </AutoScrollArea>
  )
}
