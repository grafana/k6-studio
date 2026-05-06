import { ClickDetails } from '@/components/Browser/ClickPill'
import {
  LocatorClickDebugEvent,
  LocatorDoubleClickDebugEvent,
} from '@/main/runner/schema'
import { toClickButton, toClickModifiers } from '@/utils/clickOptions'

export function toClickDetails(
  action: LocatorClickDebugEvent | LocatorDoubleClickDebugEvent
): ClickDetails {
  return {
    button: toClickButton(action.options),
    modifiers: toClickModifiers(action.options?.modifiers),
  }
}
