import { css } from '@emotion/react'
import { Text, Flex } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { PlayButton } from './PlayButton'
import { formatTime } from './PlaybackControls.utils'
import { TimelineSlider } from './Timeline/TimelineSlider'
import { PlaybackState, Time } from './types'

export interface OnSeekEvent {
  time: number
  commit: boolean
}

interface PlaybackControlsProps {
  state: PlaybackState
  streaming: boolean
  time: Time
  actions: BrowserActionEvent[]
  onPlay: () => void
  onPause: () => void
  onSeek: ({ time, commit }: OnSeekEvent) => void
}

export function PlaybackControls({
  state,
  streaming,
  time,
  actions = [],
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  const handleSeek = (seekTime: number, commit: boolean) => {
    onSeek({ time: seekTime, commit })
  }

  return (
    <Flex
      css={css`
        background-color: var(--gray-2);
        border-top: 1px solid var(--gray-a5);
      `}
      align="center"
      gap="4"
      py="2"
      px="4"
      minHeight="40px"
    >
      <PlayButton
        playing={state === 'playing'}
        streaming={streaming}
        onPlay={onPlay}
        onPause={onPause}
      />

      <TimelineSlider
        css={css`
          flex: 1 1 0;
          min-width: 0;
        `}
        time={time}
        actions={actions}
        disabled={streaming}
        onSeek={handleSeek}
      />
      <Text
        asChild
        size="1"
        css={css`
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        `}
      >
        <Flex align="center" justify="end" minWidth="80px">
          {formatTime(time.current)} / {formatTime(time.total)}
        </Flex>
      </Text>
    </Flex>
  )
}
