import { css } from '@emotion/react'
import { Badge, Code } from '@radix-ui/themes'
import { BracesIcon, TestTubeDiagonalIcon } from 'lucide-react'

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
    <Badge
      highContrast
      color="gray"
      css={css`
        flex-shrink: 1;
        overflow: hidden;
        cursor: ${isRecording ? 'pointer' : 'default'};

        &:hover {
          background-color: ${isRecording ? 'var(--gray-4)' : undefined};
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {selector.testId ? <TestTubeDiagonalIcon /> : <BracesIcon />}
      <Code variant="ghost" truncate>
        {selector.testId ?? selector.css}
      </Code>
    </Badge>
  )
}
