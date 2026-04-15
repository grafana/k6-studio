import { AnyBrowserAction } from '@/main/runner/schema'

import { BrowserActionInstance } from './types'

export function toBrowserActionInstance(
  action: AnyBrowserAction
): BrowserActionInstance {
  const id = crypto.randomUUID()

  if ('locator' in action) {
    return {
      id,
      ...action,
      locator: {
        current: action.locator.type,
        values: {
          [action.locator.type]: action.locator,
        },
      },
    }
  }

  return { id, ...action }
}

export function fromBrowserActionInstance({
  id: _id,
  ...action
}: BrowserActionInstance): AnyBrowserAction {
  if ('locator' in action) {
    const locator = action.locator.values[action.locator.current]

    if (locator === undefined) {
      throw new Error(
        `Current locator of type "${action.locator.current}" not found in locator values.`
      )
    }

    return {
      ...action,
      locator,
    }
  }

  return action
}
