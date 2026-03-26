import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { NodeSelector } from '@/schemas/selectors'

interface ReplayerHighlightsProps {
  player: Replayer | null
  selector: NodeSelector | null
}

export function ReplayerHighlights({
  player,
  selector,
}: ReplayerHighlightsProps) {
  return (
    <ElementHighlights
      element={player?.iframe?.contentDocument?.documentElement ?? null}
      selector={selector}
    />
  )
}
