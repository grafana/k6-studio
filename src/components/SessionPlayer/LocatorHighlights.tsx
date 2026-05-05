import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator } from '@/schemas/locator'

interface LocatorHighlightsProps {
  player: Replayer | null
  locator: ElementLocator | null
}

export function LocatorHighlights({ player, locator }: LocatorHighlightsProps) {
  return (
    <ElementHighlights
      element={player?.iframe?.contentDocument?.documentElement ?? null}
      locator={locator}
    />
  )
}
