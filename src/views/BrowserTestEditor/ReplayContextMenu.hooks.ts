import { useMemo } from 'react'

import { ContextMenuEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { getAriaDetails } from '@/utils/dom/aria'
import { findInteractiveElement } from '@/utils/dom/dom'
import { generateSelectors } from '@/utils/dom/selectors'

import { buildLocatorOptions } from './ReplayContextMenu.utils'

export function useContextMenuTarget(event: ContextMenuEvent | null) {
  return useMemo(() => {
    if (event === null) {
      return null
    }

    const target = findInteractiveElement(event.target) ?? event.target

    const aria = getAriaDetails(target)
    const selectors = generateSelectors(target, aria)

    const locator = buildLocatorOptions(selectors)

    return {
      target,
      position: {
        x: event.x,
        y: event.y,
      },
      aria,
      locator,
    }
  }, [event])
}
