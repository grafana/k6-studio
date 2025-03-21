import { css } from '@emotion/react'
import { Strong } from '@radix-ui/themes'

import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  children: string
}

export function Selector({ children: selector }: SelectorProps) {
  const isRecording = useIsRecording()

  const handleMouseEnter = () => {
    if (isRecording) {
      window.studio.browserRemote.highlightElement(selector)
    }
  }

  const handleMouseLeave = () => {
    if (isRecording) {
      window.studio.browserRemote.highlightElement(null)
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
      {selector}
    </Strong>
  )
}
