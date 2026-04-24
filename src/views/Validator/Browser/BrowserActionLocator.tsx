import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'

import { useHighlightSelector } from '../../../components/HighlightSelectorProvider'

interface BrowserActionLocatorProps {
  locator: ActionLocator
}

export function BrowserActionLocator({ locator }: BrowserActionLocatorProps) {
  const setHighlightedSelector = useHighlightSelector()

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      setHighlightedSelector(null)

      return
    }

    setHighlightedSelector(locator)
  }

  return <Locator locator={locator} onHighlightChange={handleHighlightChange} />
}
