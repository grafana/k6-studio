import { css } from '@emotion/react'
import { IconButton, Spinner } from '@radix-ui/themes'
import { PauseIcon, PlayIcon } from 'lucide-react'

interface PlayButtonProps {
  playing: boolean
  streaming: boolean
  onPlay: () => void
  onPause: () => void
}

export function PlayButton({
  playing,
  streaming,
  onPlay,
  onPause,
}: PlayButtonProps) {
  const handlePlayPause = () => {
    if (playing) {
      onPause()

      return
    }

    onPlay()
  }

  if (streaming) {
    return <Spinner size="1" />
  }

  return (
    <IconButton
      css={css`
        svg {
          fill: var(--accent-9);
          width: 14px !important;
          height: 14px !important;
          min-width: 14px !important;
          min-height: 14px !important;
          stroke-linecap: butt !important;
          stroke-linejoin: round;
        }
      `}
      variant="ghost"
      size="1"
      radius="full"
      onClick={handlePlayPause}
    >
      {playing && <PauseIcon />}
      {!playing && <PlayIcon />}
    </IconButton>
  )
}
