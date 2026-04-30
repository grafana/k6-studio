import { Locator } from '@/components/Browser/Locator'
import { ElementLocator } from '@/schemas/locator'

import { useHighlightLocator } from '../../../components/HighlightLocatorProvider'

interface BrowserElementLocatorProps {
  locator: ElementLocator
}

export function BrowserElementLocator({ locator }: BrowserElementLocatorProps) {
  const setHighlightedLocator = useHighlightLocator()

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      setHighlightedLocator(null)

      return
    }

    setHighlightedLocator(locator)
  }

  return <Locator locator={locator} onHighlightChange={handleHighlightChange} />
}
