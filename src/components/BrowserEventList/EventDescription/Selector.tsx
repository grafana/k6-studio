import { css } from '@emotion/react'
import { BracesIcon, TestTubeDiagonalIcon } from 'lucide-react'

import { ElementSelector } from '@/schemas/recording'
import { useIsRecording } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/frontend/view/types'

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
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        gap: calc(var(--studio-spacing-1) * 1.5);
        flex-shrink: 1;
        padding: calc(var(--studio-spacing-1) * 0.5)
          calc(var(--studio-spacing-1) * 1.5);
        overflow: hidden;
        background-color: var(--gray-3);
        color: var(--gray-12);
        border-radius: 3px;
        font-size: var(--studio-font-size-1);

        ${isRecording &&
        css`
          &:hover {
            cursor: pointer;
            background-color: var(--gray-4);
          }
        `}
      `}
    >
      {selector.testId ? <TestTubeDiagonalIcon /> : <BracesIcon />}
      <code
        css={css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        {selector.testId ?? selector.css}
      </code>
    </div>
  )
}
