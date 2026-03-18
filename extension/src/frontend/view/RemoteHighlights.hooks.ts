import { useEffect, useRef, useState } from 'react'
import {
  getByAltText,
  getByLabelText,
  getByPlaceholderText,
  getByRole,
  getByTestId,
  getByText,
  getByTitle,
  queryAllByAltText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByRole,
  queryAllByTestId,
  queryAllByText,
  queryAllByTitle,
} from '@testing-library/dom'

import { HighlightSelector } from 'extension/src/messaging/types'

import { useStudioClient } from './StudioClientProvider'
import { useHighlightDebounce } from './hooks/useHighlightDebounce'
import { Bounds } from './types'
import { getElementBounds } from './utils'

interface Highlight {
  id: number
  element: Element
  bounds: Bounds
}

function findElementsBySelector(selector: HighlightSelector): Element[] {
  switch (selector.type) {
    case 'css':
      return Array.from(document.querySelectorAll(selector.selector))

    case 'test-id':
      return queryAllByTestId(document.body, selector.testId)

    case 'role':
      return queryAllByRole(document.body, selector.role, {
        name: selector.name,
      })

    case 'alt':
      return queryAllByAltText(document.body, selector.text)

    case 'label':
      return queryAllByLabelText(document.body, selector.text)

    case 'placeholder':
      return queryAllByPlaceholderText(document.body, selector.text)

    case 'text':
      return queryAllByText(document.body, selector.text)

    case 'title':
      return queryAllByTitle(document.body, selector.text)

    default:
      return []
  }
}

export function useHighlightedElements() {
  const client = useStudioClient()
  const idCounter = useRef(0)

  const [selector, setSelector] = useState<HighlightSelector | null>(null)
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setSelector(data.selector)
    })
  }, [client])

  useEffect(() => {
    if (selector === null) {
      setHighlights(null)

      return
    }

    try {
      const elements = findElementsBySelector(selector)
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
