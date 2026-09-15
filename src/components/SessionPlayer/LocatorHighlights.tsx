import { Replayer } from 'rrweb'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { HighlightedLocator } from '@/components/HighlightLocatorProvider'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'

interface LocatorHighlightsProps {
  player: Replayer | null
  target: HighlightedLocator | Element | null
}

interface ResolvedTarget {
  target: ElementLocator | Element | null
  frames?: LocatorOptions[]
}

// The target is either a DOM element (e.g. a clicked element in the replay) or a
// highlighted locator that may live inside a chain of iframes. We can't use
// `instanceof Element` here because the element comes from the replay iframe's
// realm, so we check structurally instead.
function resolveTarget(
  value: HighlightedLocator | Element | null
): ResolvedTarget {
  if (value === null) {
    return { target: null }
  }

  if ('locator' in value) {
    return { target: value.locator, frames: value.frames }
  }

  return { target: value }
}

export function LocatorHighlights({ player, target }: LocatorHighlightsProps) {
  const resolved = resolveTarget(target)

  return (
    <ElementHighlights
      root={player?.iframe?.contentDocument?.documentElement ?? null}
      target={resolved.target}
      frames={resolved.frames}
    />
  )
}
