import { css } from '@emotion/react'
import { BracesIcon, ImageIcon, TestTubeDiagonalIcon } from 'lucide-react'

import { getNodeSelector, NodeSelector } from '@/codegen/browser/selectors'
import { ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { useIsRecording } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/messaging/types'

import { RoleSelectorIcon } from './RoleSelectorIcon'

interface SelectorComponentProps {
  selector: NodeSelector
}

function SelectorIcon({ selector }: SelectorComponentProps) {
  switch (selector.type) {
    case 'css':
      return <BracesIcon />

    case 'test-id':
      return <TestTubeDiagonalIcon />

    case 'alt':
      return <ImageIcon />

    case 'role':
      return <RoleSelectorIcon selector={selector} />

    default:
      return exhaustive(selector)
  }
}

function SelectorText({ selector }: SelectorComponentProps) {
  switch (selector.type) {
    case 'css':
      return <code>{selector.selector}</code>

    case 'test-id':
      return <code>{selector.testId}</code>

    case 'alt':
      return <code>{`"${selector.text}"`}</code>

    case 'role':
      return (
        <>
          <strong>{selector.role}</strong> {`"${selector.name}"`}
        </>
      )

    default:
      return exhaustive(selector)
  }
}

interface SelectorProps {
  selectors: ElementSelector
  onHighlight: (selector: HighlightSelector | null) => void
}

export function Selector({ selectors, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const nodeSelector = getNodeSelector(selectors)

  const handleMouseEnter = () => {
    if (isRecording) {
      onHighlight({
        type: 'css',
        selector: selectors.css,
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SelectorIcon selector={nodeSelector} />
      <code
        css={css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        <SelectorText selector={nodeSelector} />
      </code>
    </div>
  )
}
