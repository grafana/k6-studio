import { css } from '@emotion/react'
import { Box, Flex, Reset, Text } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { BrowserActionStatusIcon } from './BrowserActionStatusIcon'
import { BrowserActionText } from './BrowserActionText'
import { BrowserActionTimer } from './BrowserActionTimer'

interface BrowserActionItemProps {
  event: BrowserActionEvent
}

function BrowserActionItem({ event }: BrowserActionItemProps) {
  const result = event.type === 'end' ? event.result : null

  return (
    <Text asChild size="1">
      <li
        css={css`
          display: grid;
          grid-template-columns: 24px 1fr auto;
          align-items: center;
          padding: var(--space-2);
          gap: var(--space-2);

          border-bottom: 1px solid var(--gray-5);
        `}
      >
        <Flex
          minWidth="20px"
          justify="center"
          align="center"
          gap="2"
          css={css`
            svg.lucide {
              min-width: 20px;
              min-height: 20px;
            }
          `}
        >
          <BrowserActionStatusIcon event={event} />
        </Flex>
        <Box
          css={css`
            flex: 1 1 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          <BrowserActionText action={event.action} />
        </Box>
        <Box pr="2">
          <BrowserActionTimer
            started={event.timestamp.started}
            ended={event.type === 'end' && event.timestamp.ended}
          />
        </Box>
        {result?.type === 'error' && (
          <Box
            css={css`
              color: var(--red-11);
              grid-column: 2 / span 1;
            `}
          >
            Error: {result.error}
          </Box>
        )}
      </li>
    </Text>
  )
}

interface BrowserActionListProps {
  actions: BrowserActionEvent[]
}

export function BrowserActionList({ actions }: BrowserActionListProps) {
  return (
    <Reset>
      <ul>
        {actions.map((action) => (
          <BrowserActionItem key={action.eventId} event={action} />
        ))}
      </ul>
    </Reset>
  )
}
