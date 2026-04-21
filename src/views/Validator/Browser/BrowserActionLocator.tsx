import { toNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'

import { useHighlightSelector } from './HighlightSelectorProvider'

interface BrowserActionLocatorProps {
  locator: ActionLocator
}

export function BrowserActionLocator({ locator }: BrowserActionLocatorProps) {
  const nodeLocator = toNodeSelector(locator)
  const setHighlightedSelector = useHighlightSelector()

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      setHighlightedSelector(null)

      return
    }

    setHighlightedSelector(nodeLocator)
  }

  return (
    <Locator locator={nodeLocator} onHighlightChange={handleHighlightChange} />
  )
}
