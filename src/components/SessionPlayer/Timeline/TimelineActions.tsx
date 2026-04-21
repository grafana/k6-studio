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
  index: number
  segments: [Segment, ...Segment[]]
}

interface Segment {
  id: string
  start: number
  end: number
  action: BrowserActionEvent
}

function buildLanes(actions: BrowserActionEvent[], time: Time) {
  const lanes: Lane[] = []

  for (const action of actions) {
    if (action.timestamp.started > time.end) {
      continue
    }

    const segment: Segment = {
      id: action.eventId,
      start: action.timestamp.started,
      end: Math.min(time.end, action.timestamp.ended ?? time.end),
      action,
    }

    /**
     * From top-to-bottom, find the first lane that doesn't intersect with the current segment.
     * This is the lane where we will put the current segment. If no such lane exists, we will
     * hvae to create a new lane.
     */
    const lane = lanes.find((lane) => {
      const lastSegment = lane.segments[lane.segments.length - 1]

      return lastSegment !== undefined && !isIntersecting(lastSegment, segment)
    })

    if (lane === undefined) {
      lanes.push({ index: lanes.length, segments: [segment] })

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
  const [showTooltip, setShowTooltip] = useState(false)

  const mouseDownX = useRef<number>(undefined)

  const start = segment.start - time.start
  const end = segment.end - time.start

  const left = (start / time.total) * 100
  const width = ((end - start) / time.total) * 100

  const style = {
    left: `${left}%`,
    width: `${width}%`,
  }

  const status = segment.action.result?.type ?? 'unknown'

  const handlePointerDown = (ev: MouseEvent<HTMLElement>) => {
    mouseDownX.current = ev.clientX
  }

  const handleClick = (ev: MouseEvent<HTMLElement>) => {
    // We want to allow users to drag the timeline so we only register the click
    // if the mouse hasn't moved by more than a few pixels.
    const deltaX = ev.clientX - (mouseDownX.current ?? ev.clientX)

    if (Math.abs(deltaX) < 10) {
      onSeek(segment.action.timestamp.started)
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
              z-index: 0;

              padding: 0;

              position: absolute;
              inset: 0;
              cursor: pointer;
              box-sizing: border-box;

              border: none;
              border-radius: var(--slider-border-radius);
              box-shadow: 0 0 0 1px var(--black-a5);

              transition:
                transform 0.1s ease,
                background-color 0.1s ease;

              &:disabled {
                cursor: default;
              }

              &:hover {
                transform: scaleY(1.5);
                z-index: 1;
              }

              &[data-status='success'] {
                background-color: var(--green-9);
              }

              &[data-status='error'] {
                background-color: var(--red-9);
              }

              &[data-status='aborted'] {
                background-color: var(--orange-9);
              }

              &[data-status='unknown'] {
                background-color: var(--gray-9);
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
        padding-bottom: 6px;
      `}
    >
      {lanes.map(({ index: id, segments }) => (
        <div
          key={id}
          css={css`
            position: relative;
            height: 6px;
            width: 100%;

            margin-top: 1px;

            &:first-of-type {
              margin-top: 0;
            }
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
