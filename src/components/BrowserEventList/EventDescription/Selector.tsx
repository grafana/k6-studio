import { css } from '@emotion/react'

import { ElementSelector } from '@/schemas/recording'
import { useIsRecording } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/messaging/types'

interface SelectorProps {
  selector: ElementSelector
  onHighlight: (selector: HighlightSelector | null) => void
}

export function Selector({ selector, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()

  const handleMouseEnter = () => {
    if (isRecording) {
      onHighlight({
        type: 'css',
        selector: selector.css,
      })
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
      {selector.css}
    </strong>
  )
}
