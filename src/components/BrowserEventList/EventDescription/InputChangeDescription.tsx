import { css } from '@emotion/react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

import { InputChangeEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  padding: 0 0.3em;
  cursor: pointer;
  color: var(--studio-foreground);

  opacity: 1;

  &:hover {
    opacity: 0.7;
  }

  & > svg.lucide {
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
    <>
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
        {showValue && <EyeOffIcon />}
        {!showValue && <EyeIcon />}
      </button>
      {'"'}
    </>
  )
}

interface InputChangeDescriptionProps {
  event: InputChangeEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function InputChangeDescription({
  event,
  onHighlight,
}: InputChangeDescriptionProps) {
  return (
    <>
      Changed input of{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />{' '}
      to{' '}
      <code>
        <MaskedValue sensitive={event.sensitive} value={event.value} />
      </code>
    </>
  )
}
