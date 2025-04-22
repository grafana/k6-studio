import { useEffect, useRef, useState } from 'react'

import { HighlightSelector } from 'extension/src/messaging/types'

import { client } from '../routing'

import { useHighlightDebounce } from './hooks/useHighlightDebounce'
import { Bounds } from './types'
import { getElementBounds } from './utils'

interface Highlight {
  id: number
  element: Element
  bounds: Bounds
}

export function useHighlightedElements() {
  const idCounter = useRef(0)

  const [selector, setSelector] = useState<HighlightSelector | null>(null)
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setSelector(data.selector)
    })
  }, [])

  useEffect(() => {
    if (selector === null) {
      setHighlights(null)

      return
    }

    const elements = document.querySelectorAll(selector.selector)
    const highlights = Array.from(elements).map((element) => {
      const bounds = getElementBounds(element)

      return {
        id: idCounter.current++,
        element,
        bounds,
      }
    })

    setHighlights(highlights)
  }, [selector])

  useEffect(() => {
    if (selector === null) {
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
  }, [selector])

  return useHighlightDebounce(highlights)
}
