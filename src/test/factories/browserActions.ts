import { LocatorClickAction } from '@/main/runner/schema'
import { WithEditorMetadata } from '@/views/BrowserTestEditor/types'

export function buildClickAction(
  overrides: Partial<WithEditorMetadata<LocatorClickAction>> = {}
): WithEditorMetadata<LocatorClickAction> {
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
