import { ClickedEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { Kbd } from '@radix-ui/themes'
import { Selector } from './Selector'

function getModifierKeys(modifiers: ClickedEvent['modifiers']) {
  const keys = []
  const platform = window.studio.app.platform

  if (modifiers.ctrl) {
    keys.push('⌃ Ctrl')
  }

  if (modifiers.shift) {
    keys.push('⇧ Shift')
  }

  if (modifiers.alt) {
    keys.push(platform === 'darwin' ? '⌥ Option' : '⌥ Alt')
  }

  if (modifiers.meta) {
    keys.push(platform === 'darwin' ? '⌘ Command' : '⊞ Meta')
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
}

export function ClickDescription({ event }: ClickDescriptionProps) {
  const modifiers = getModifierKeys(event.modifiers)
  const button = getButtonDescription(event)

  const clickedText = modifiers.concat(button).join(' + ')

  return (
    <>
      <Kbd size="2">{clickedText}</Kbd> on element{' '}
      <Selector>{event.selector}</Selector>.
    </>
  )
}
