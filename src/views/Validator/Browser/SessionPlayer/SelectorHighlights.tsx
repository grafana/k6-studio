import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { NodeSelector } from '@/schemas/selectors'

interface SelectorHighlightsProps {
  player: Replayer | null
  selector: NodeSelector | null
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
