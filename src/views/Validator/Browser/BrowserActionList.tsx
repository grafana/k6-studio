import { css } from '@emotion/react'
import { Box, Flex, Reset, Text } from '@radix-ui/themes'

import { BrowserDebuggerEvent } from '@/main/runner/schema'

import { BrowserActionTimer } from './BrowserActionTimer'
import { DebuggerEventError } from './DebuggerEventError'
import { DebuggerEventStatusIcon } from './DebuggerEventStatusIcon'
import { DebuggerEventText } from './DebuggerEventText'

const itemStyles = css`
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  padding: var(--space-2);
  gap: var(--space-2);
  border-bottom: 1px solid var(--gray-5);
`

const iconStyles = css`
  svg.lucide {
    min-width: 20px;
    min-height: 20px;
  }
`

const textStyles = css`
  flex: 1 1 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

interface BrowserActionItemProps {
  event: BrowserDebuggerEvent
}

function DebuggerEventItem({ event }: BrowserActionItemProps) {
  return (
    <Text asChild size="1">
      <li css={itemStyles}>
        <Flex
          minWidth="20px"
          justify="center"
          align="center"
          gap="2"
          css={iconStyles}
        >
          <DebuggerEventStatusIcon event={event} />
        </Flex>
        <Box css={textStyles}>
          <DebuggerEventText event={event} />
        </Box>
        <Box pr="2">
          <BrowserActionTimer
            started={event.timestamp.started}
            ended={event.state === 'end' && event.timestamp.ended}
          />
        </Box>
        <DebuggerEventError event={event} />
      </li>
    </Text>
  )
}

interface BrowserActionListProps {
  actions: BrowserDebuggerEvent[]
}

export function BrowserActionList({ actions }: BrowserActionListProps) {
  return (
    <Reset>
      <ul>
        {actions.map((event) => (
          <DebuggerEventItem key={event.eventId} event={event} />
        ))}
      </ul>
    </Reset>
  )
}
