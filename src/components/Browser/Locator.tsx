import { css } from '@emotion/react'
import {
  BracesIcon,
  CaptionsIcon,
  CaseSensitiveIcon,
  ImageIcon,
  LucideProps,
  TagIcon,
  TestTubeDiagonalIcon,
  WholeWordIcon,
} from 'lucide-react'

import { NodeSelector } from '@/codegen/browser/selectors'
import { exhaustive } from '@/utils/typescript'

import { RoleLocatorIcon } from './RoleLocatorIcon'

interface LocatorComponentProps extends LucideProps {
  locator: NodeSelector
}

function quote(str: string) {
  return `"${str}"`
}

function LocatorIcon({ locator, ...props }: LocatorComponentProps) {
  switch (locator.type) {
    case 'css':
      return <BracesIcon {...props} />

    case 'test-id':
      return <TestTubeDiagonalIcon {...props} />

    case 'alt':
      return <ImageIcon {...props} />

    case 'label':
      return <TagIcon {...props} />

    case 'placeholder':
      return <WholeWordIcon {...props} />

    case 'title':
      return <CaptionsIcon {...props} />

    case 'text':
      return <CaseSensitiveIcon {...props} />

    case 'role':
      return <RoleLocatorIcon selector={locator} {...props} />

    default:
      return exhaustive(locator)
  }
}

function LocatorText({ locator }: LocatorComponentProps) {
  switch (locator.type) {
    case 'css':
      return <code>{locator.selector}</code>

    case 'test-id':
      return <code>{locator.testId}</code>

    case 'label':
      return <code>{quote(locator.text)}</code>

    case 'placeholder':
      return <code>{quote(locator.text)}</code>

    case 'title':
      return <code>{quote(locator.text)}</code>

    case 'alt':
      return <code>{quote(locator.text)}</code>

    case 'text':
      return <code>{locator.text}</code>

    case 'role':
      return (
        <>
          <strong>{locator.role}</strong> {quote(locator.name)}
        </>
      )

    default:
      return exhaustive(locator)
  }
}

interface LocatorProps {
  locator: NodeSelector
  onHighlightChange?: (highlighted: boolean) => void
}

export function Locator({ locator, onHighlightChange }: LocatorProps) {
  const handleMouseEnter = () => {
    onHighlightChange?.(true)
  }

  const handleMouseLeave = () => {
    onHighlightChange?.(false)
  }

  return (
    <div
      css={css`
        display: inline-flex;
        align-items: baseline;
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

        ${onHighlightChange !== undefined &&
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
      <LocatorIcon
        css={css`
          align-self: center;
        `}
        locator={locator}
      />
      <code
        css={css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 300px;
        `}
      >
        <LocatorText locator={locator} />
      </code>
    </div>
  )
}
