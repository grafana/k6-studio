import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator } from '@/schemas/locator'

interface SelectorHighlightsProps {
  player: Replayer | null
  selector: ElementLocator | null
}

export function SelectorHighlights({
  player,
  selector,
}: SelectorHighlightsProps) {
  return (
    <ElementHighlights
      element={player?.iframe?.contentDocument?.documentElement ?? null}
      selector={selector}
    />
  )
}
