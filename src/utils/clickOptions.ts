import type {
  LocatorClickAction,
  LocatorClickButton,
  LocatorClickModifier,
} from '@/main/runner/schema'

export interface ClickModifiers {
  alt: boolean
  ctrl: boolean
  meta: boolean
  shift: boolean
}

const NO_MODIFIERS: ClickModifiers = {
  alt: false,
  ctrl: false,
  meta: false,
  shift: false,
}

export function toClickModifiers(
  modifiers: LocatorClickModifier[] | undefined
): ClickModifiers {
  if (!modifiers || modifiers.length === 0) {
    return { ...NO_MODIFIERS }
  }

  return {
    alt: modifiers.includes('Alt'),
    ctrl: modifiers.includes('Control'),
    meta: modifiers.includes('Meta'),
    shift: modifiers.includes('Shift'),
  }
}

export function toClickButton(
  options: LocatorClickAction['options']
): LocatorClickButton {
  return options?.button ?? 'left'
}
