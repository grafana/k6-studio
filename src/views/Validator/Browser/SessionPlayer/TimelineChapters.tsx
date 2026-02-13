import { css } from '@emotion/react'
import { Box, Reset } from '@radix-ui/themes'
import { PointerEvent, useCallback, useRef, useState } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { TimelineTooltip } from './TimelineTooltip'
import { Time } from './types'

function getActionsAtTime(
  actions: BrowserActionEvent[],
  timeMs: number,
  time: Time
): BrowserActionEvent[] {
  return actions.filter((action) => {
    const started = action.timestamp.started
    const ended = action.timestamp.ended ?? time.end
    return timeMs >= started && timeMs <= ended
  })
}

interface TimelineChaptersProps {
  disabled?: boolean
  time: Time
  actions: BrowserActionEvent[]
  onSeek: (time: number) => void
}

interface Segment {
  id: string
  flex: number
  start: number
  end: number
  action: BrowserActionEvent
}

function buildSegments(actions: BrowserActionEvent[], time: Time): Segment[] {
  const segments: Segment[] = []

  for (const action of actions) {
    const actionStarted = action.timestamp.started
    const actionEnded = action.timestamp.ended ?? time.end

    const start = Math.max(0, actionStarted - time.start)
    const end = Math.min(time.total, actionEnded - time.start)

    const duration = Math.max(0, end - start)

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
  time: Time
  disabled?: boolean
  hoverTime: number | null
  segment: Segment
  onSeek: (time: number) => void
}

function Segment({ time, disabled, hoverTime, segment, onSeek }: SegmentProps) {
  const left = (segment.start / time.total) * 100
  const width = ((segment.end - segment.start) / time.total) * 100

  const style = {
    minWidth: segment.action ? 2 : 0,
    left: `${left}%`,
    width: `${width}%`,
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
          position: absolute;
          top: 0;
          bottom: 0;
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
  actions,
  time,
  onSeek,
}: TimelineChaptersProps) {
  const segments = buildSegments(actions, time)
  const trackRef = useRef<HTMLDivElement>(null)

  const [hoverTime, setHoverTime] = useState<number | null>(null)

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const el = trackRef.current

      if (el === null) {
        return
      }

      const bounds = el.getBoundingClientRect()
      const fraction = Math.max(
        0,
        Math.min(1, (e.clientX - bounds.left) / bounds.width)
      )

      setHoverTime(time.start + fraction * time.total)
    },
    [time.start, time.total]
  )

  const handlePointerLeave = useCallback(() => {
    setHoverTime(null)
  }, [])

  const hoverOffset = hoverTime && hoverTime - time.start

  const actionsAtHover =
    hoverTime !== null ? getActionsAtTime(actions, hoverTime, time) : []

  return (
    <Box
      ref={trackRef}
      css={css`
        position: relative;
        --chapters-background-color: var(--gray-5);
        width: 100%;
        min-height: 8px;
        flex-shrink: 0;
        min-width: 0;
        background-color: var(--chapters-background-color);
      `}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <TimelineTooltip
        disabled={disabled}
        time={time}
        hoverTime={hoverTime}
        actions={actionsAtHover}
      />

      {segments.map((segment) => (
        <Segment
          key={segment.id}
          time={time}
          disabled={disabled}
          hoverTime={hoverOffset}
          segment={segment}
          onSeek={onSeek}
        />
      ))}
    </Box>
  )
}
