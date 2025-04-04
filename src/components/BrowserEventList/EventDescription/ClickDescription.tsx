import { Kbd } from '@/components/primitives/Kbd'
import { ClickedEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

function getModifierKeys(modifiers: ClickedEvent['modifiers']) {
  const keys = []

  if (modifiers.ctrl) {
    keys.push('⌃ Ctrl')
  }

  if (modifiers.shift) {
    keys.push('⇧ Shift')
  }

  if (modifiers.alt) {
    keys.push(TARGET_PLATFORM === 'darwin' ? '⌥ Option' : '⌥ Alt')
  }

  if (modifiers.meta) {
    keys.push(TARGET_PLATFORM === 'darwin' ? '⌘ Command' : '⊞ Meta')
  }

  return keys
}

function getButtonDescription(event: ClickedEvent) {
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
  event: ClickedEvent
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
