import {
  LocatorClickAction,
  LocatorToBeCheckedAction,
} from '@/schemas/browserTest'
import { elementLocatorOptions } from '@/schemas/locator'

export function buildClickAction(
  overrides: Partial<LocatorClickAction> = {}
): LocatorClickAction {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: elementLocatorOptions({
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
    locator: elementLocatorOptions({
      type: 'css',
      selector: 'input[type="checkbox"]',
    }),
    ...overrides,
  }
}
