import { css } from '@emotion/react'
import { Reset } from '@radix-ui/themes'
import { MouseEvent, useRef, useState } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { Time } from '../types'

import { TimelineTooltip } from './TimelineTooltip'

function isIntersecting(previous: Segment, current: Segment) {
  return (
    (previous.end >= current.start && previous.start <= current.end) ||
    (previous.start >= current.start && previous.end <= current.end)
  )
}

interface TimelineActionsProps {
  disabled?: boolean
  time: Time
  actions: BrowserActionEvent[]
  onSeek: (time: number) => void
}

interface Lane {
  id: number
  segments: Segment[]
}

interface Segment {
  id: string
  flex: number
  start: number
  end: number
  lane: number
  action: BrowserActionEvent
}

function buildLanes(actions: BrowserActionEvent[], time: Time) {
  const segments: Segment[] = []

  for (const [index, action] of actions.entries()) {
    if (action.timestamp.started > time.end) {
      continue
    }

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
    }

    segments.push(segment)
  }

  const lanes: Lane[] = []

  for (const segment of segments) {
    const lane = lanes[segment.lane]

    if (lane === undefined) {
      lanes[segment.lane] = { id: segment.lane, segments: [segment] }

      continue
    }

    lane.segments.push(segment)
  }

  return lanes
}

interface SegmentProps {
  time: Time
  disabled?: boolean
  segment: Segment
  onSeek: (time: number) => void
}

function Segment({ time, disabled, segment, onSeek }: SegmentProps) {
  const mouseDownX = useRef<number>(undefined)

  const [showTooltip, setShowTooltip] = useState(false)

  const left = (segment.start / time.total) * 100
  const width = ((segment.end - segment.start) / time.total) * 100

  const style = {
    left: `${left}%`,
    width: `${width}%`,
  }

  const status = segment.action.result?.type ?? 'unknown'

  const handlePointerDown = (ev: MouseEvent<HTMLElement>) => {
    mouseDownX.current = ev.clientX
  }

  const handleClick = (ev: MouseEvent<HTMLElement>) => {
    const deltaX = ev.clientX - (mouseDownX.current ?? ev.clientX)

    if (Math.abs(deltaX) < 10) {
      onSeek(segment.start)
    }
  }

  const handleMouseEnter = () => {
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div
      css={css`
        position: absolute;
        top: 0;
        bottom: 0;
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <Reset>
        <TimelineTooltip open={showTooltip} action={segment.action}>
          <button
            disabled={disabled}
            data-status={status}
            css={css`
              position: absolute;
              inset: 0;
              cursor: pointer;
              box-sizing: border-box;

              border: none;
              border-radius: var(--slider-border-radius);

              transition:
                transform 0.1s ease,
                background-color 0.1s ease;

              &:disabled {
                cursor: not-allowed;
              }

              &:hover {
                transform: scaleY(1.5);
              }

              &[data-status='success'] {
                background-color: var(--green-9);
              }

              &[data-status='error'] {
                background-color: var(--red-10);
              }

              &[data-status='aborted'] {
                background-color: var(--orange-9);
              }

              &[data-status='unknown'] {
                background-color: var(--gray-11);
              }
            `}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
          />
        </TimelineTooltip>
      </Reset>
    </div>
  )
}

export function TimelineActions({
  disabled = false,
  actions,
  time,
  onSeek,
}: TimelineActionsProps) {
  const lanes = buildLanes(actions, time)

  return (
    <div
      css={css`
        padding-bottom: 4px;
      `}
    >
      {lanes.map(({ id, segments }) => (
        <div
          key={id}
          css={css`
            position: relative;
            height: 6px;
            width: 100%;
          `}
        >
          {segments.map((segment) => (
            <Segment
              key={segment.id}
              time={time}
              disabled={disabled}
              segment={segment}
              onSeek={onSeek}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
