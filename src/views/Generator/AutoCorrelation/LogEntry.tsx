import { Box, Flex, Progress, Text } from '@radix-ui/themes'
import { memo } from 'react'

import { formatTime } from '@/components/SessionPlayer/PlaybackControls.utils'

import { SimpleMarkdown } from './SimpleMarkdown'
import { ActionLogEntry } from './types'

function outcomeStyle(color: string): React.CSSProperties {
  return {
    borderLeft: `3px solid var(--${color}-8)`,
    backgroundColor: `var(--${color}-2)`,
    borderRadius: '0 var(--radius-2) var(--radius-2) 0',
    padding: 'var(--space-2) var(--space-3)',
  }
}

const outcomeStyles: Partial<
  Record<ActionLogEntry['type'], React.CSSProperties>
> = {
  'outcome-success': outcomeStyle('green'),
  'outcome-partial': outcomeStyle('amber'),
  'outcome-failure': outcomeStyle('red'),
}

const GRAY_TYPES = new Set(['info', 'found'])

export const LogEntry = memo(function LogEntry({
  entry,
}: {
  entry: ActionLogEntry
}) {
  return (
    <Flex gap="3" px="3" py="1" align="start">
      <Text
        size="1"
        color="gray"
        css={{
          fontFamily: 'var(--code-font-family)',
          flexShrink: 0,
          width: 44,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          lineHeight: 'var(--line-height-2)',
        }}
      >
        {formatTime(entry.timestamp)}
      </Text>
      <Box css={{ minWidth: 0, flex: 1, ...outcomeStyles[entry.type] }}>
        <Text
          size="2"
          color={GRAY_TYPES.has(entry.type) ? 'gray' : undefined}
          css={{ wordBreak: 'break-word' }}
          as="div"
        >
          <SimpleMarkdown text={entry.text ?? ''} />
        </Text>
        {entry.validationProgress && (
          <Progress
            value={Math.min(
              (entry.validationProgress.completed /
                entry.validationProgress.total) *
                100,
              100
            )}
            size="1"
            mt="1"
          />
        )}
      </Box>
    </Flex>
  )
})
