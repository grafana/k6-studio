import { css } from '@emotion/react'
import { IconButton, Spinner } from '@radix-ui/themes'
import { PauseIcon, PlayIcon } from 'lucide-react'

interface PlayButtonProps {
  playing: boolean
  disabled: boolean
  streaming: boolean
  onPlay: () => void
  onPause: () => void
}

export function PlayButton({
  playing,
  disabled,
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
          width: 18px !important;
          height: 18px !important;
          min-width: 18px !important;
          min-height: 18px !important;
          stroke-width: 0 !important;
          stroke-linecap: butt !important;
          stroke-linejoin: round;
        }
      `}
      disabled={disabled}
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
