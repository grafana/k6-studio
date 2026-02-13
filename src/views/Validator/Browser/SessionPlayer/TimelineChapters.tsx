import { css } from '@emotion/react'
import { Box, Reset } from '@radix-ui/themes'
import { PointerEvent, useCallback, useRef, useState } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { TimelineTooltip } from './TimelineTooltip'
import { Time } from './types'

const MIN_LANE_HEIGHT = 3
const MIN_TIMELINE_HEIGHT = 10

function isIntersecting(previous: Segment, current: Segment) {
  return (
    (previous.end > current.start && previous.start < current.end) ||
    (previous.start > current.start && previous.end < current.end)
  )
}

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
  lane: number
  action: BrowserActionEvent
}

function buildSegments(actions: BrowserActionEvent[], time: Time) {
  const segments: Segment[] = []

  let lanes = 1

  for (const [index, action] of actions.entries()) {
    const actionStarted = action.timestamp.started
    const actionEnded = action.timestamp.ended ?? time.end

    const start = Math.max(0, actionStarted - time.start)
    const end = Math.min(time.total, actionEnded - time.start)

    const duration = Math.max(0, end - start)

    const segment: Segment = {
      id: action.eventId,
      flex: duration,
      start,
      end,
      lane: 0,
      action,
    }

    // We need to figure out which lane the segment should be in.
    //
    // We do this by walking backwards through the segments until we find a
    // segment that doesn't intersect with the current segment. The segment's
    // lane is one lane above the top-most intersecting segment's lane.
    for (let i = index - 1; i >= 0; i--) {
      const previous = segments[i]

      if (previous === undefined || !isIntersecting(previous, segment)) {
        break
      }

      segment.lane = Math.max(segment.lane, previous.lane + 1)

      // Keep track of the total number of lanes.
      lanes = Math.max(lanes, segment.lane + 1)
    }

    segments.push(segment)
  }

  return { segments, lanes }
}

interface SegmentProps {
  time: Time
  lanes: number
  disabled?: boolean
  hoverTime: number | null
  segment: Segment
  onSeek: (time: number) => void
}

function Segment({
  time,
  lanes,
  disabled,
  hoverTime,
  segment,
  onSeek,
}: SegmentProps) {
  const left = (segment.start / time.total) * 100
  const width = ((segment.end - segment.start) / time.total) * 100
  const height = Math.max(MIN_LANE_HEIGHT, MIN_TIMELINE_HEIGHT / lanes)

  const style = {
    minWidth: segment.action ? 2 : 0,
    left: `${left}%`,
    width: `${width}%`,
    top: `${segment.lane * height}px`,
    height: `${height}px`,
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
  const trackRef = useRef<HTMLDivElement>(null)

  const { lanes, segments } = buildSegments(actions, time)

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
        min-height: 10px;
        flex-shrink: 0;
        min-width: 0;
        background-color: var(--chapters-background-color);
      `}
      style={{
        height: lanes * MIN_LANE_HEIGHT,
      }}
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
          lanes={lanes}
          disabled={disabled}
          hoverTime={hoverOffset}
          segment={segment}
          onSeek={onSeek}
        />
      ))}
    </Box>
  )
}
