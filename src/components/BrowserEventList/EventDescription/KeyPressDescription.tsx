import { Kbd } from '@/components/primitives/Kbd'
import { ClickEvent, KeyPressEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

function getModifierKeys(modifiers: ClickEvent['modifiers']) {
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

interface KeyPresskDescriptionProps {
  event: KeyPressEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function KeyPressDescription({
  event,
  onHighlight,
}: KeyPresskDescriptionProps) {
  const modifiers = getModifierKeys(event.modifiers)
  const pressedText = modifiers.concat(event.key).join(' + ')

  return (
    <>
      Pressed <Kbd>{pressedText}</Kbd> on element{' '}
      <Selector selector={event.selector} onHighlight={onHighlight} />
    </>
  )
}
