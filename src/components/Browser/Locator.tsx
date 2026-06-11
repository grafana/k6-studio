import { css } from '@emotion/react'
import {
  BracesIcon,
  CaptionsIcon,
  CaseSensitiveIcon,
  ImageIcon,
  LucideProps,
  SquareStackIcon,
  TagIcon,
  TestTubeDiagonalIcon,
  WholeWordIcon,
} from 'lucide-react'
import { Fragment } from 'react'

import { ElementLocator } from '@/schemas/locator'
import { exhaustive } from '@/utils/typescript'

import { RoleLocatorIcon } from './RoleLocatorIcon'

interface LocatorComponentProps extends LucideProps {
  locator: ElementLocator
}

function quote(str: string) {
  return `"${str}"`
}

export function LocatorIcon({ locator, ...props }: LocatorComponentProps) {
  switch (locator.type) {
    case 'css':
      return <BracesIcon {...props} />

    case 'testid':
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
      return <RoleLocatorIcon locator={locator} {...props} />

    default:
      return exhaustive(locator)
  }
}

export function LocatorText({ locator }: LocatorComponentProps) {
  switch (locator.type) {
    case 'css':
      return locator.selector

    case 'testid':
      return locator.testId

    case 'label':
      return quote(locator.label)

    case 'placeholder':
      return quote(locator.placeholder)

    case 'title':
      return quote(locator.title)

    case 'alt':
      return quote(locator.text)

    case 'text':
      return quote(locator.text)

    case 'role':
      return (
        <>
          <strong>{locator.role}</strong>{' '}
          {locator.options?.name ? quote(locator.options.name) : ''}
        </>
      )

    default:
      return exhaustive(locator)
  }
}

const iconStyles = css`
  align-self: center;
  && {
    width: 12px;
    height: 12px;
    min-width: 12px;
    min-height: 12px;
  }
`

const codeStyles = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  font-size: 0.9em;
`

// Beyond this many frames the chain is summarized as a count.
const COLLAPSE_THRESHOLD = 2

// Renders the iframe context after the element, reading "<element> in <frame>
// in <frame>" innermost-first, or "in N frames" once the chain gets deep.
function FrameChain({ frames }: { frames: ElementLocator[] }) {
  if (frames.length === 0) {
    return null
  }

  if (frames.length > COLLAPSE_THRESHOLD) {
    return <span>in {frames.length} frames</span>
  }

  return (
    <>
      {[...frames].reverse().map((frame, index) => (
        <Fragment key={index}>
          <span>in</span>
          <SquareStackIcon aria-label="iframe" css={iconStyles} />
          <code css={codeStyles}>
            <LocatorText locator={frame} />
          </code>
        </Fragment>
      ))}
    </>
  )
}

interface LocatorProps {
  locator: ElementLocator
  // Chain of iframe locators (outermost first) the element lives in, shown after
  // the element as " in <frame>" so an element inside an iframe is recognizable.
  frames?: ElementLocator[]
  onHighlightChange?: (highlighted: boolean) => void
}

export function Locator({
  locator,
  frames = [],
  onHighlightChange,
}: LocatorProps) {
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
      <LocatorIcon css={iconStyles} locator={locator} />
      <code css={codeStyles}>
        <LocatorText locator={locator} />
      </code>
      <FrameChain frames={frames} />
    </div>
  )
}
