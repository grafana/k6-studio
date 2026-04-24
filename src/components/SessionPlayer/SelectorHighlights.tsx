import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ActionLocator } from '@/main/runner/schema'

interface SelectorHighlightsProps {
  player: Replayer | null
  selector: ActionLocator | null
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
