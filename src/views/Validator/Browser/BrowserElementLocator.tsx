import { Locator } from '@/components/Browser/Locator'
import {
  ElementLocator,
  getCurrentLocator,
  LocatorOptions,
} from '@/schemas/locator'

import { useHighlightLocator } from '../../../components/HighlightLocatorProvider'

interface BrowserElementLocatorProps {
  locator: ElementLocator
  frames?: LocatorOptions[]
}

export function BrowserElementLocator({
  locator,
  frames,
}: BrowserElementLocatorProps) {
  const setHighlightedLocator = useHighlightLocator()

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      setHighlightedLocator(null)

      return
    }

    setHighlightedLocator({ locator, frames })
  }

  const frameLocators = frames?.map(getCurrentLocator) ?? []

  return (
    <Locator
      locator={locator}
      frames={frameLocators}
      onHighlightChange={handleHighlightChange}
    />
  )
}
