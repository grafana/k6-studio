import { Kbd } from '@/components/primitives/Kbd'
import { ClickEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'
import { getModifierKeys } from './utils'

function getButtonDescription(event: ClickEvent) {
  switch (event.button) {
    case 'left':
      return 'Clicked'

    case 'middle':
      return 'Middle-clicked'

    case 'right':
      return 'Right-clicked'

    default:
      return exhaustive(event.button)
  }
}

interface ClickDescriptionProps {
  event: ClickEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function ClickDescription({
  event,
  onHighlight,
}: ClickDescriptionProps) {
  const modifiers = getModifierKeys(event.modifiers)
  const button = getButtonDescription(event)

  const clickedText = modifiers.concat(button).join(' + ')

  return (
    <>
      <Kbd>{clickedText}</Kbd> on element{' '}
      <Selector selector={event.selector} onHighlight={onHighlight} />
    </>
  )
}
