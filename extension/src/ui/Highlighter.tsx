import { useState } from 'react'
import { useServerMessage } from './hooks'
import { Bounds } from './types'
import { ElementHighlight } from './ElementHighlight'

function useHighlights() {
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

interface HighlighterProps {
  enabled?: boolean
}

export function Highlighter({ enabled }: HighlighterProps) {
  const bounds = useHighlights()

  if (!enabled) {
    return null
  }

  return (
    <>
      {enabled &&
        bounds.map((bound, index) => (
          <ElementHighlight key={index} bounds={bound} />
        ))}
    </>
  )
}
