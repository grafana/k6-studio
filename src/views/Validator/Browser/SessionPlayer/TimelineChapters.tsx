import { css } from '@emotion/react'
import { Box, Flex, Reset } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { Time } from './types'

interface TimelineChaptersProps {
  disabled?: boolean
  actions: BrowserActionEvent[]
  time: Time
  hoverTime: number | null
  onSeek: (time: number) => void
}

interface Segment {
  id: string
  flex: number
  start: number
  end: number
  action?: BrowserActionEvent
}

function buildSegments(actions: BrowserActionEvent[], time: Time): Segment[] {
  const segments: Segment[] = []

  for (const [index, action] of actions.entries()) {
    const actionStarted = action.timestamp.started
    const actionEnded = action.timestamp.ended ?? time.end

    const start = Math.max(0, actionStarted - time.start)
    const end = Math.min(time.total, actionEnded - time.start)

    const duration = Math.max(0, end - start)

    const prevEnd = actions[index - 1]?.timestamp.ended ?? start
    const gapFlex = Math.max(0, start - prevEnd)

    // Add a gap between actions
    if (index !== 0 && gapFlex > 0) {
      segments.push({
        id: 'gap-' + action.eventId,
        flex: gapFlex,
        start,
        end,
      })
    }

    segments.push({
      id: action.eventId,
      flex: duration,
      start,
      end,
      action,
    })
  }

  return segments
}

interface SegmentProps {
  disabled?: boolean
  hoverTime: number | null
  segment: Segment
  onSeek: (time: number) => void
}

function Segment({ disabled, hoverTime, segment, onSeek }: SegmentProps) {
  const style = {
    flex: `${segment.flex} 0 0`,
    minWidth: segment.action ? 2 : 0,
  }

  if (segment.action === undefined) {
    return <Box style={style} />
  }

  const status = segment.action.result?.type ?? 'unknown'

  const handleClick = () => {
    if (segment.action === undefined) {
      return
    }

    onSeek(segment.start)
  }

  return (
    <Reset>
      <button
        disabled={disabled}
        data-hover={
          hoverTime !== null &&
          hoverTime >= segment.start &&
          hoverTime <= segment.end
        }
        data-status={status}
        css={css`
          border-radius: 2px;
          box-sizing: border-box;
          border-right: 1px solid var(--chapters-background-color);

          &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }

          &:last-child {
            border-right: none;
          }

          &[data-status='success'] {
            background-color: var(--green-a5);

            &[data-hover='true']:not(:disabled) {
              background-color: var(--green-a7);
            }

            &:hover:not(:disabled) {
              background-color: var(--green-9);
            }
          }

          &[data-status='error'] {
            background-color: var(--red-a5);

            &[data-hover='true']:not(:disabled) {
              background-color: var(--red-a7);
            }

            &:hover:not(:disabled) {
              background-color: var(--red-9);
            }
          }

          &[data-status='aborted'] {
            background-color: var(--orange-a5);

            &[data-hover='true']:not(:disabled) {
              background-color: var(--orange-a7);
            }

            &:hover:not(:disabled) {
              background-color: var(--orange-9);
            }
          }

          &[data-status='unknown'] {
            background-color: var(--gray-a5);

            &[data-hover='true']:not(:disabled) {
              background-color: var(--gray-a7);
            }

            &:hover:not(:disabled) {
              background-color: var(--gray-9);
            }
          }
        `}
        style={style}
        onClick={handleClick}
      />
    </Reset>
  )
}

export function TimelineChapters({
  disabled = false,
  hoverTime,
  actions,
  time,
  onSeek,
}: TimelineChaptersProps) {
  const segments = buildSegments(actions, time)
  const hoverOffset = hoverTime && hoverTime - time.start

  return (
    <Flex
      css={css`
        --chapters-background-color: var(--gray-5);
        width: 100%;
        min-height: 8px;
        flex-shrink: 0;
        min-width: 0;
        background-color: var(--chapters-background-color);
      `}
    >
      {segments.map((segment) => (
        <Segment
          key={segment.id}
          disabled={disabled}
          hoverTime={hoverOffset}
          segment={segment}
          onSeek={onSeek}
        />
      ))}
    </Flex>
  )
}
