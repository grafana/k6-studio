import { toNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'

interface BrowserActionLocatorProps {
  locator: ActionLocator
}

export function BrowserActionLocator({ locator }: BrowserActionLocatorProps) {
  const nodeLocator = toNodeSelector(locator)

  return <Locator locator={nodeLocator} />
}
