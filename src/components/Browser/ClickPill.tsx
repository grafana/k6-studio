import { Kbd } from '@/components/primitives/Kbd'
import { ClickEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

export interface ClickDetails {
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

function conjugate(pastTense: boolean, verb: string) {
  return pastTense ? verb + 'ed' : verb
}

function getButtonDescription(button: ClickEvent['button']) {
  switch (button) {
    case 'left':
      return 'Click'

    case 'middle':
      return 'Middle-click'

    case 'right':
      return 'Right-click'

    default:
      return exhaustive(button)
  }
}

function getDoubleClickButtonDescription(button: ClickEvent['button']) {
  switch (button) {
    case 'left':
      return 'Double-click'

    case 'middle':
      return 'Middle-double-click'

    case 'right':
      return 'Right-double-click'

    default:
      return exhaustive(button)
  }
}

interface ClickPillProps {
  pastTense?: boolean
  details: ClickDetails
}

export function ClickPill({ pastTense = false, details }: ClickPillProps) {
  const buttonDescription = conjugate(
    pastTense,
    getButtonDescription(details.button)
  )

  const clickedText = getModifierKeys(details.modifiers)
    .concat(buttonDescription)
    .join(' + ')

  return <Kbd>{clickedText}</Kbd>
}

export function DoubleClickPill({
  pastTense = false,
  details,
}: ClickPillProps) {
  const buttonDescription = conjugate(
    pastTense,
    getDoubleClickButtonDescription(details.button)
  )

  const clickedText = getModifierKeys(details.modifiers)
    .concat(buttonDescription)
    .join(' + ')

  return <Kbd>{clickedText}</Kbd>
}
