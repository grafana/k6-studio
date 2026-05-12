import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator } from '@/schemas/locator'

interface LocatorHighlightsProps {
  player: Replayer | null
  target: ElementLocator | Element | null
}

export function LocatorHighlights({ player, target }: LocatorHighlightsProps) {
  return (
    <ElementHighlights
      root={player?.iframe?.contentDocument?.documentElement ?? null}
      target={target}
    />
  )
}
