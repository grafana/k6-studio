import {
  LocatorClickAction,
  LocatorToBeCheckedAction,
} from '@/schemas/browserTest'
import { newSyntheticKey } from '@/utils/zod'

export function buildClickAction(
  overrides: Partial<LocatorClickAction> = {}
): LocatorClickAction {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: {
      key: newSyntheticKey(),
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'button',
          options: { exact: false },
        },
      },
    },
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
    locator: {
      key: newSyntheticKey(),
      current: 'css',
      values: { css: { type: 'css', selector: 'input[type="checkbox"]' } },
    },
    ...overrides,
  }
}
