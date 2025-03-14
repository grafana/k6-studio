import { css } from '@emotion/react'
import { Strong } from '@radix-ui/themes'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  value: string
  onHighlight: (selector: string | null) => void
}

export function Selector({ value, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()

  const handleMouseEnter = () => {
    if (isRecording) {
      onHighlight(value)
    }
  }

  const handleMouseLeave = () => {
    if (isRecording) {
      onHighlight(null)
    }
  }

  return (
    <Strong
      css={css`
        font-weight: bold;
        border-radius: var(--radius-2);
        padding: 0 0.25rem;

        ${isRecording &&
        css`
          &:hover {
            cursor: pointer;
            background-color: var(--gray-3);
          }
        `}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {value}
    </Strong>
  )
}
