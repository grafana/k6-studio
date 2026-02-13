import { css } from '@emotion/react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Flex, Popover, VisuallyHidden } from '@radix-ui/themes'
import { PointerEvent, useCallback, useRef, useState } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { BrowserActionStatusIcon } from '../BrowserActionStatusIcon'
import { BrowserActionText } from '../BrowserActionText'

import { TimelineChapters } from './TimelineChapters'
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

interface TimelineSliderProps {
  className?: string
  time: Time
  actions: BrowserActionEvent[]
  disabled?: boolean
  onSeek: (time: number, commit: boolean) => void
}

interface TimelineTooltipProps {
  disabled?: boolean
  time: Time
  hoverTime: number | null
  actions: BrowserActionEvent[]
}

function TimelineTooltip({
  disabled,
  time,
  hoverTime,
  actions,
}: TimelineTooltipProps) {
  return (
    <Popover.Root open={!disabled && hoverTime !== null && actions.length > 0}>
      <Popover.Trigger key={hoverTime}>
        <div
          css={css`
            position: absolute;
            top: 0;
            width: 0;
            height: 0;
          `}
          style={{
            left: hoverTime
              ? `${((hoverTime - time.start) / time.total) * 100}%`
              : 0,
          }}
        />
      </Popover.Trigger>
      <Popover.Content asChild side="top" align="center" size="1">
        <Flex
          css={css`
            font-size: var(--font-size-1);
            border-radius: var(--radius-2);
          `}
          direction="column"
          p="0"
        >
          {hoverTime &&
            actions.map((action) => (
              <Flex
                key={action.eventId}
                align="center"
                py="2"
                px="4"
                css={css`
                  border-bottom: 1px solid var(--gray-5);

                  &:last-child {
                    border-bottom: none;
                  }

                  min-height: 28px;
                `}
              >
                <Flex align="center" gap="2">
                  <BrowserActionStatusIcon event={action} />
                  <BrowserActionText action={action.action} />
                </Flex>
              </Flex>
            ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

export function TimelineSlider({
  className,
  time,
  actions,
  disabled = false,
  onSeek,
}: TimelineSliderProps) {
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

  const actionsAtHover =
    hoverTime !== null ? getActionsAtTime(actions, hoverTime, time) : []

  const handleChapterSeek = useCallback(
    (time: number) => {
      onSeek(time, true)
    },
    [onSeek]
  )

  const handleValueChange = useCallback(
    ([value]: number[]) => {
      if (value === undefined) return
      onSeek(value, false)
    },
    [onSeek]
  )

  const handleValueCommit = useCallback(
    ([value]: number[]) => {
      if (value === undefined) return
      onSeek(value, true)
    },
    [onSeek]
  )

  return (
    <Flex
      ref={trackRef}
      gap="1px"
      direction="column"
      className={className}
      css={css`
        position: relative;
        width: 100%;
        min-width: 0;
        cursor: ${disabled ? 'default' : 'pointer'};
        border-radius: var(--radius-2);
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

      <TimelineChapters
        disabled={disabled}
        hoverTime={hoverTime}
        time={time}
        actions={actions}
        onSeek={handleChapterSeek}
      />

      <SliderPrimitive.Root
        value={[time.current]}
        min={0}
        max={time.total}
        step={0.001}
        disabled={disabled}
        css={css`
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 5px;
          flex-shrink: 0;
        `}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
      >
        <SliderPrimitive.Track
          css={css`
            position: relative;
            flex-grow: 1;
            height: 100%;
            background-color: var(--gray-a7);
            border-radius: 1px;

            &[data-disabled] {
              cursor: not-allowed;
              opacity: 0.5;
            }
          `}
        >
          <SliderPrimitive.Range
            css={css`
              position: absolute;
              height: 100%;
              background-color: var(--accent-9);
              border-radius: 1px;
            `}
          />
        </SliderPrimitive.Track>
        <VisuallyHidden>
          <SliderPrimitive.Thumb
            aria-label="Playback position"
            css={css`
              display: block;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: var(--gray-12);
              border: 1px solid var(--gray-a7);
              box-shadow: 0 1px 2px var(--black-a3);
              pointer-events: auto;
            `}
          />
        </VisuallyHidden>
      </SliderPrimitive.Root>
    </Flex>
  )
}
