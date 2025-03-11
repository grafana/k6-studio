import { useState } from 'react'
import { Bounds } from './types'
import { useServerMessage } from './hooks/useServerMessage'

export function useHighlightedElements() {
  const [bounds, setBounds] = useState<Bounds[]>([])

  useServerMessage((message) => {
    if (message.type !== 'highlight-element') {
      return
    }

    if (message.selector === null) {
      setBounds([])

      return
    }

    const element = document.querySelectorAll(message.selector)

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

  return bounds
}
