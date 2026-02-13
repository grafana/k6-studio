import { css } from '@emotion/react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Flex, VisuallyHidden } from '@radix-ui/themes'
import { useCallback } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

import { TimelineChapters } from './TimelineChapters'
import { Time } from './types'

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
    <Flex
      gap="2px"
      direction="column"
      className={className}
      css={css`
        width: 100%;
        min-width: 0;
        cursor: ${disabled ? 'default' : 'pointer'};
        border-radius: var(--radius-2);
      `}
    >
      <TimelineChapters
        disabled={disabled}
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
