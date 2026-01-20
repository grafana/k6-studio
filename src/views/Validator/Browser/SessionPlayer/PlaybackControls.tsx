import { css } from '@emotion/react'
import { Text, Flex, Slider } from '@radix-ui/themes'

import { PlayButton } from './PlayButton'
import { formatTime } from './PlaybackControls.utils'

export interface OnSeekEvent {
  time: number
  commit: boolean
}

interface PlaybackControlsProps {
  playing: boolean
  currentTime: number
  totalTime: number
  onPlay: () => void
  onPause: () => void
  onSeek: ({ time, commit }: OnSeekEvent) => void
}

export function PlaybackControls({
  playing,
  currentTime,
  totalTime,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  const handlePositionChange = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    onSeek({ time: newTime, commit: false })
  }

  const handlePositionCommit = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    onSeek({ time: newTime, commit: true })
  }

  return (
    <Flex
      css={css`
        background-color: var(--gray-2);
        border-top: 1px solid var(--gray-a5);
      `}
      py="2"
      px="4"
      align="center"
      gap="4"
    >
      <PlayButton playing={playing} onPlay={onPlay} onPause={onPause} />

      <Slider
        size="1"
        value={[currentTime]}
        step={0.001}
        min={0}
        max={totalTime}
        onValueChange={handlePositionChange}
        onValueCommit={handlePositionCommit}
      />
      <Text
        asChild
        size="1"
        css={css`
          white-space: nowrap;
        `}
      >
        <Flex align="center" justify="end" minWidth="80px">
          {formatTime(currentTime)} / {formatTime(totalTime)}
        </Flex>
      </Text>
    </Flex>
  )
}
