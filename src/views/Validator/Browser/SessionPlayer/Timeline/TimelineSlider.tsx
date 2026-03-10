import { css } from '@emotion/react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useCallback } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { Time } from '../types'

import { TimelineActions } from './TimelineActions'

interface TimelineSliderProps {
  className?: string
  time: Time
  actions: BrowserActionEvent[]
  disabled?: boolean
  onSeek: (time: number, commit: boolean) => void
}

export function TimelineSlider({
  className,
  time,
  actions,
  disabled = false,
  onSeek,
}: TimelineSliderProps) {
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
    <SliderPrimitive.Root
      asChild
      className={className}
      css={css`
        position: relative;
        display: flex;
        align-items: center;
        touch-action: none;

        // We want the thumb to slightly overflow the track, so we need to add some
        // negative margin to the track. Unfortunately, Radix UI wraps the thumb in
        // an extra element that is absolutely positioned and there's no way to target
        // it directly, so we need to target it using the :nth-child selector.
        > :nth-child(2) {
          top: -2px;
          bottom: -2px;
        }
      `}
      value={[time.current]}
      min={0}
      max={time.total}
      step={0.001}
      disabled={disabled}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
    >
      <div>
        <SliderPrimitive.Track
          css={css`
            --slider-border-radius: var(--radius-1);

            z-index: 0;

            position: relative;
            flex: 1 1 0;
            min-height: 20px;
            border-radius: var(--slider-border-radius);
            background-color: var(--gray-5);
            box-shadow: inset 0 0 0 1px var(--gray-a6);
          `}
        >
          <TimelineActions
            time={time}
            disabled={disabled}
            actions={actions}
            onSeek={handleChapterSeek}
          />
          <SliderPrimitive.Range
            css={css`
              position: absolute;
              top: 0;
              height: 100%;
              background: white;
              opacity: 0.3;
              border-radius: var(--slider-border-radius);
              pointer-events: none;
            `}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label="Timeline position"
          css={css`
            z-index: 1;

            display: block;
            width: 4px;
            height: calc(100%);
            background-color: white;
            border: 1px solid var(--gray-a8);
            box-shadow: var(--shadow-2);
            transition:
              transform 120ms ease,
              box-shadow 120ms ease;

            &:hover {
              transform: scale(1.08);
            }

            &:focus-visible {
              outline: none;
              box-shadow:
                0 0 0 3px var(--blue-a5),
                0 2px 6px var(--black-a6);
            }

            &[data-disabled] {
              cursor: not-allowed;
            }
          `}
        />
      </div>
    </SliderPrimitive.Root>
  )
}
