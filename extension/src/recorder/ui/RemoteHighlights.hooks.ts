import { useEffect, useState } from 'react'

import { background } from '../client'

import { Bounds } from './types'

export function useHighlightedElements() {
  const [bounds, setBounds] = useState<Bounds[]>([])

  useEffect(() => {
    return background.on('highlight-element', ({ data }) => {
      if (data.selector === null) {
        setBounds([])

        return
      }

      const element = document.querySelectorAll(data.selector)

      const bounds = Array.from(element).map((el) => {
        const { top, left, width, height } = el.getBoundingClientRect()

        return {
          top,
          left,
          width,
          height,
        }
      })

      setBounds(bounds)
    })
  }, [])

  return bounds
}
