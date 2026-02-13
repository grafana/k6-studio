import { css } from '@emotion/react'
import { Box, Flex, Tooltip } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { BrowserActionText } from '../BrowserActionText'

import { Time } from './types'

function formatDuration(started: number, ended: number) {
  return `${((ended - started) / 1000).toFixed(1)}s`
}

interface TimelineChaptersProps {
  actions: BrowserActionEvent[]
  time: Time
}

interface Segment {
  id: string
  flex: number
  action?: BrowserActionEvent
}

function buildSegments(actions: BrowserActionEvent[], time: Time): Segment[] {
  const segments: Segment[] = []

  for (const [index, action] of actions.entries()) {
    const actionStarted = action.timestamp.started
    const actionEnded = action.timestamp.ended ?? time.end

    const startOffset = Math.max(0, actionStarted - time.start)
    const endOffset = Math.min(time.total, actionEnded - time.start)

    const duration = Math.max(0, endOffset - startOffset)

    const prevEnd = actions[index - 1]?.timestamp.ended ?? startOffset

    // Add a gap between actions
    if (index !== 0) {
      segments.push({
        id: 'gap-' + action.eventId,
        flex: Math.max(0, startOffset - prevEnd),
      })
    }

    segments.push({ id: action.eventId, flex: duration, action })
  }

  return segments
}

function Segment({ time, segment }: { time: Time; segment: Segment }) {
  const style = {
    flex: `${segment.flex} 0 0`,
    minWidth: segment.action ? 2 : 0,
  }

  if (segment.action === undefined) {
    return <Box style={style} />
  }

  const status = segment.action.result?.type ?? 'unknown'

  return (
    <Tooltip
      content={
        <Flex direction="column" gap="1">
          <Box>
            <BrowserActionText action={segment.action.action} />
          </Box>
          <Box
            css={css`
              font-variant-numeric: tabular-nums;
            `}
          >
            {formatDuration(
              segment.action.timestamp.started,
              segment.action.timestamp.ended ?? time.end
            )}
          </Box>
        </Flex>
      }
    >
      <Box
        data-status={status}
        css={css`
          border-radius: 2px;
          cursor: default;

          &[data-status='success'] {
            background-color: var(--green-a5);

            &:hover {
              background-color: var(--green-11);
            }
          }

          &[data-status='error'] {
            background-color: var(--red-a5);

            &:hover {
              background-color: var(--red-11);
            }
          }

          &[data-status='aborted'] {
            background-color: var(--orange-a5);

            &:hover {
              background-color: var(--orange-11);
            }
          }

          &[data-status='unknown'] {
            background-color: var(--gray-a5);

            &:hover {
              background-color: var(--gray-11);
            }
          }
        `}
        style={style}
      />
    </Tooltip>
  )
}

export function TimelineChapters({ actions, time }: TimelineChaptersProps) {
  const segments = buildSegments(actions, time)

  return (
    <Flex
      gap="1px"
      css={css`
        width: 100%;
        min-height: 8px;
        flex-shrink: 0;
        min-width: 0;
        background-color: var(--gray-a5);
      `}
    >
      {segments.map((segment) => (
        <Segment key={segment.id} time={time} segment={segment} />
      ))}
    </Flex>
  )
}
