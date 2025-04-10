import { useEffect, useRef, useState } from 'react'

import { client } from '../routing'

import { useHighlightDebounce } from './hooks/useHighlightDebounce'
import { Bounds } from './types'

interface Highlight {
  id: number
  bounds: Bounds
}

export function useHighlightedElements() {
  const idCounter = useRef(0)
  const [bounds, setBounds] = useState<Highlight[] | null>(null)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      if (data.selector === null) {
        setBounds(null)

        return
      }

      const elements = document.querySelectorAll(data.selector.selector)

      const bounds = Array.from(elements).map((el) => {
        const { top, left, width, height } = el.getBoundingClientRect()

        return {
          id: idCounter.current++,
          bounds: {
            top,
            left,
            width,
            height,
          },
        }
      })

      setBounds(bounds)
    })
  }, [])

  return useHighlightDebounce(bounds)
}
