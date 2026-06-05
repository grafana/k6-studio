import { AnyBrowserAction } from '@/schemas/browserTest'
import { AssertEvent } from '@/schemas/recording'
import { toLocatorOptions } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

export function convertAssertion(
  event: AssertEvent
): AnyBrowserAction | undefined {
  const locator = toLocatorOptions(event.target.selectors)
  const assertion = event.assertion

  switch (assertion.type) {
    case 'visibility':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toBeVisible',
        locator,
        visible: assertion.visible,
      }

    case 'text':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toContainText',
        locator,
        expected: assertion.operation.value,
      }

    case 'text-input':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toHaveValue',
        locator,
        expected: {
          current: 'single',
          values: { single: assertion.expected },
        },
      }

    case 'check':
      if (assertion.expected === 'indeterminate') return undefined
      return {
        id: crypto.randomUUID(),
        method: 'locator.toBeChecked',
        locator,
        checked: assertion.expected === 'checked',
        inputType: assertion.inputType,
      }

    default:
      return exhaustive(assertion)
  }
}
