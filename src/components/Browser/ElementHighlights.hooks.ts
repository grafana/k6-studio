import { useEffect, useRef, useState } from 'react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ElementLocator } from '@/schemas/locator'
import { isElement } from '@/utils/dom/realm'
import { findElementsByLocator } from '@/utils/selectors'

import { Bounds } from './types'
import { getElementBounds } from './utils'

interface Highlight {
  id: number
  element: Element
  bounds: Bounds
}

export function useHighlightedElements(
  root: HTMLElement | null,
  target: ElementLocator | Element | null
) {
  const idCounter = useRef(0)
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)

  useEffect(() => {
    if (root === null || target === null) {
      setHighlights(null)

      return
    }

    const toHighlight = (element: Element) => {
      const bounds = getElementBounds(element)

      return {
        id: idCounter.current++,
        element,
        bounds,
      }
    }

    if (isElement(target)) {
      setHighlights([toHighlight(target)])

      return
    }

    try {
      const elements = findElementsByLocator(root, target)
      const highlights = elements.map((element) => toHighlight(element))

      setHighlights(highlights)
    } catch {
      setHighlights([])
    }
  }, [root, target])

  useEffect(() => {
    if (root === null || target === null) {
      return
    }

    const observer = new ResizeObserver(() => {
      setHighlights((highlights) => {
        if (highlights === null) {
          return null
        }

        return highlights.map((highlight) => {
          return {
            ...highlight,
            bounds: getElementBounds(highlight.element),
          }
        })
      })
    })

    observer.observe(document.body)

    return () => {
      observer.disconnect()
    }
  }, [root, target])

  return useDebouncedValue({
    value: highlights,
    delay: 30,
    maxWait: 60,
  })
}
