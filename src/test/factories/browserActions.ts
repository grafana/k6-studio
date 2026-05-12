import {
  LocatorClickAction,
  LocatorToBeCheckedAction,
} from '@/schemas/browserTest'

export function buildClickAction(
  overrides: Partial<LocatorClickAction> = {}
): LocatorClickAction {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: {
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
    id: 'assert-1',
    method: 'locator.toBeChecked',
    checked: true,
    inputType: 'native',
    locator: {
      current: 'css',
      values: { css: { type: 'css', selector: 'input[type="checkbox"]' } },
    },
    ...overrides,
  }
}
