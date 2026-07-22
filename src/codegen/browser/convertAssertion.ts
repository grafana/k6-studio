import { AnyBrowserAction } from '@/schemas/browserTest'
import { AssertEvent } from '@/schemas/recording'
import { toFrameOptions, toLocatorOptions } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

export function convertAssertion(
  event: AssertEvent
): AnyBrowserAction | undefined {
  const locator = toLocatorOptions(event.target.selectors)
  const frames = toFrameOptions(event.frames)
  const assertion = event.assertion

  switch (assertion.type) {
    case 'visibility':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toBeVisible',
        locator,
        frames,
        visible: assertion.visible,
      }

    case 'text':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toContainText',
        locator,
        frames,
        expected: assertion.operation.value,
      }

    case 'text-input':
      return {
        id: crypto.randomUUID(),
        method: 'locator.toHaveValue',
        locator,
        frames,
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
        frames,
        checked: assertion.expected === 'checked',
        inputType: assertion.inputType,
      }

    default:
      return exhaustive(assertion)
  }
}
