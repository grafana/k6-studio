import { LocatorClickAction } from '@/schemas/browserTest'

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
