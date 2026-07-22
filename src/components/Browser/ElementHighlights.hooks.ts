import { useEffect, useRef, useState } from 'react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import {
  collectLayoutShiftWindows,
  observeWindowsForLayoutShift,
} from '@/utils/dom/layout'
import { isElement } from '@/utils/dom/realm'
import { findElementsByFrameChain } from '@/utils/selectors'

import { Bounds } from './types'
import { getElementBoundsWithin } from './utils'

interface Highlight {
  id: number
  element: Element
  bounds: Bounds
}

export function useHighlightedElements(
  root: HTMLElement | null,
  target: ElementLocator | Element | null,
  frames?: LocatorOptions[]
) {
  const idCounter = useRef(0)
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)

  useEffect(() => {
    if (root === null || target === null) {
      setHighlights(null)

      return
    }

    const rootWindow = root.ownerDocument.defaultView

    const toHighlight = (element: Element) => ({
      id: idCounter.current++,
      element,
      bounds: getElementBoundsWithin(element, rootWindow),
    })

    const resolveElements = (): Element[] => {
      if (isElement(target)) {
        return [target]
      }

      try {
        return findElementsByFrameChain(root, frames, target)
      } catch {
        return []
      }
    }

    const elements = resolveElements()

    setHighlights(elements.map(toHighlight))

    const recompute = () => {
      setHighlights(
        (highlights) =>
          highlights?.map((highlight) => ({
            ...highlight,
            bounds: getElementBoundsWithin(highlight.element, rootWindow),
          })) ?? null
      )
    }

    // A highlighted element can live inside a (nested) iframe that scrolls or
    // resizes independently of the top document, so recompute bounds on a shift
    // in any document an element belongs to.
    const windows = collectLayoutShiftWindows(
      rootWindow,
      ...elements.map((element) => element.ownerDocument.defaultView)
    )

    return observeWindowsForLayoutShift(windows, recompute)
  }, [root, target, frames])

  return useDebouncedValue({
    value: highlights,
    delay: 30,
    maxWait: 60,
  })
}
