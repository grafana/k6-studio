import { ClickDetails } from '@/components/Browser/ClickPill'
import {
  LocatorClickAction,
  LocatorDoubleClickAction,
} from '@/main/runner/schema'

export function toClickDetails(
  action: LocatorClickAction | LocatorDoubleClickAction
): ClickDetails {
  const modifiers = action.options?.modifiers ?? []

  return {
    button: action.options?.button ?? 'left',
    modifiers: {
      alt: modifiers.includes('Alt'),
      ctrl: modifiers.includes('Control'),
      meta: modifiers.includes('Meta'),
      shift: modifiers.includes('Shift'),
    },
  }
}
