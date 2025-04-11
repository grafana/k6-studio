import { css } from '@emotion/react'
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { ReactNode, useState } from 'react'

import { InputChangedEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

const valueStyles = css`
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-1);
`

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  opacity: 1;

  &:hover {
    opacity: 0.7;
  }

  & > svg {
    width: 0.9em;
    height: 0.9em;
  }
`

interface SensitiveValueProps {
  sensitive: boolean
  value: ReactNode
}

function MaskedValue({ sensitive, value }: SensitiveValueProps) {
  const [showValue, setShowValue] = useState(!sensitive)

  if (!sensitive) {
    return (
      <>
        {'"'}
        {value}
        {'"'}
      </>
    )
  }

  return (
    <span css={valueStyles}>
      {'"'}
      <span>
        {showValue && value}
        {!showValue && '••••'}
      </span>
      <button
        css={buttonStyles}
        aria-pressed={showValue}
        aria-label={showValue ? 'Hide masked value' : 'Show masked value'}
        onClick={() => setShowValue(!showValue)}
      >
        {showValue && <EyeNoneIcon />}
        {!showValue && <EyeOpenIcon />}
      </button>
      {'"'}
    </span>
  )
}

interface InputChangedDescriptionProps {
  event: InputChangedEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function InputChangedDescription({
  event,
  onHighlight,
}: InputChangedDescriptionProps) {
  return (
    <>
      Changed input of{' '}
      <Selector selector={event.selector} onHighlight={onHighlight} /> to{' '}
      <code>
        <MaskedValue sensitive={event.sensitive} value={event.value} />
      </code>
    </>
  )
}
