import { Locator } from '@/components/Browser/Locator'
import { ElementLocator } from '@/schemas/locator'

import { useHighlightSelector } from '../../../components/HighlightSelectorProvider'

interface BrowserElementLocatorProps {
  locator: ElementLocator
}

export function BrowserElementLocator({ locator }: BrowserElementLocatorProps) {
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
