import { useEffect, useState } from 'react'

import { client } from '../routing'

import { Bounds } from './types'

export function useHighlightedElements() {
  const [bounds, setBounds] = useState<Bounds[]>([])

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      if (data.selector === null) {
        setBounds([])

        return
      }

      const elements = document.querySelectorAll(data.selector)

      const bounds = Array.from(elements).map((el) => {
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
