import { css } from '@emotion/react'
import { Text, Flex, Slider, Box } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { PlayButton } from './PlayButton'
import { formatTime } from './PlaybackControls.utils'
import { TimelineChapters } from './TimelineChapters'
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
      direction="column"
      css={css`
        background-color: var(--gray-2);
        border-top: 1px solid var(--gray-a5);
      `}
      py="2"
      px="4"
      gap="2"
    >
      <Flex align="center" gap="4">
        <PlayButton
          playing={state === 'playing'}
          streaming={streaming}
          onPlay={onPlay}
          onPause={onPause}
        />

        <Box
          css={css`
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
          `}
        >
          <TimelineChapters actions={actions} time={time} />
          <Slider
            size="1"
            disabled={streaming}
            value={[time.current]}
            step={0.001}
            min={0}
            max={time.total}
            onValueChange={handlePositionChange}
            onValueCommit={handlePositionCommit}
          />
        </Box>
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
    </Flex>
  )
}
