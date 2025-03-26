import { css } from '@emotion/react'

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
    <strong
      css={css`
        font-weight: bold;
        border-radius: var(--radius-2);

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
    </strong>
  )
}
