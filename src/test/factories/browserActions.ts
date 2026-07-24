import {
  LocatorClickAction,
  LocatorToBeCheckedAction,
} from '@/schemas/browserTest'
import { targetLocatorOptions } from '@/schemas/locator'

export function buildClickAction(
  overrides: Partial<LocatorClickAction> = {}
): LocatorClickAction {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: targetLocatorOptions({
      type: 'role',
      role: 'button',
      options: { exact: false },
    }),
    ...overrides,
  }
}

export function buildToBeCheckedAction(
  overrides: Partial<LocatorToBeCheckedAction> = {}
): LocatorToBeCheckedAction {
  return {
    id: crypto.randomUUID(),
    method: 'locator.toBeChecked',
    checked: true,
    inputType: 'native',
    locator: targetLocatorOptions({
      type: 'css',
      selector: 'input[type="checkbox"]',
    }),
    ...overrides,
  }
}
