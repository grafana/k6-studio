import { Kbd } from '@/components/primitives/Kbd'
import { ClickEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

interface ClickDetails {
  button: ClickEvent['button']
  modifiers: ClickEvent['modifiers']
}

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

function getButtonDescription(
  button: ClickEvent['button'],
  pastTense: boolean
) {
  const conjugation = pastTense ? 'ed' : ''

  switch (button) {
    case 'left':
      return 'Click' + conjugation

    case 'middle':
      return 'Middle-click' + conjugation

    case 'right':
      return 'Right-click' + conjugation

    default:
      return exhaustive(button)
  }
}

interface ClickPillProps {
  pastTense?: boolean
  details: ClickDetails
}

export function ClickPill({ pastTense = false, details }: ClickPillProps) {
  const clickedText = getModifierKeys(details.modifiers)
    .concat(getButtonDescription(details.button, pastTense))
    .join(' + ')

  return <Kbd>{clickedText}</Kbd>
}
