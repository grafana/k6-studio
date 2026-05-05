import { ClickDetails } from '@/components/Browser/ClickPill'
import {
  LocatorClickAction,
  LocatorDoubleClickAction,
} from '@/main/runner/schema'
import { toClickButton, toClickModifiers } from '@/utils/clickOptions'

export function toClickDetails(
  action: LocatorClickAction | LocatorDoubleClickAction
): ClickDetails {
  return {
    button: toClickButton(action.options),
    modifiers: toClickModifiers(action.options?.modifiers),
  }
}
