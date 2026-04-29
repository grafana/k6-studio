import { useEffect, useRef, useState } from 'react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ElementLocator } from '@/schemas/locator'
import { findElementsByLocator } from '@/utils/selectors'

import { Bounds } from './types'
import { getElementBounds } from './utils'

interface Highlight {
  id: number
  element: Element
  bounds: Bounds
}

export function useHighlightedElements(
  element: HTMLElement | null,
  locator: ElementLocator | null
) {
  const idCounter = useRef(0)
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)

  useEffect(() => {
    if (element === null || locator === null) {
      setHighlights(null)

      return
    }

    try {
      const elements = findElementsByLocator(element, locator)
      const highlights = elements.map((element) => {
        const bounds = getElementBounds(element)

        return {
          id: idCounter.current++,
          element,
          bounds,
        }
      })

      setHighlights(highlights)
    } catch {
      setHighlights([])
    }
  }, [element, locator])

  useEffect(() => {
    if (element === null || locator === null) {
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
  }, [element, locator])

  return useDebouncedValue({
    value: highlights,
    delay: 30,
    maxWait: 60,
  })
}
