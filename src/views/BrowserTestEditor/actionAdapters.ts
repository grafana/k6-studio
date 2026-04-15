import { BrowserTestAction } from '@/schemas/browserTest/v1'

import { BrowserActionInstance } from './types'

export function toBrowserActionInstance(
  action: BrowserTestAction
): BrowserActionInstance {
  return { id: crypto.randomUUID(), ...action }
}

export function fromBrowserActionInstance({
  id: _id,
  ...action
}: BrowserActionInstance): BrowserTestAction {
  return action
}
