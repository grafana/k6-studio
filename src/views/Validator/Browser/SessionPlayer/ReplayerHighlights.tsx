import { css } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'

import { useDebuggerHighlight } from '../DebuggerHighlightContext'

interface Bounds {
  top: number
  left: number
  width: number
  height: number
}

interface Highlight {
  id: number
  bounds: Bounds
}

function getElementBounds(element: Element): Bounds {
  const rect = element.getBoundingClientRect()

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function ElementOutline({ bounds }: { bounds: Bounds }) {
  return (
    <div
      css={css`
        position: absolute;
        pointer-events: none;
        z-index: 999999;
        border: 2px solid var(--gray-6);
        outline: 2px solid var(--gray-12);
        outline-offset: 2px;
        background-color: var(--blue-a3);
      `}
      style={{
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      }}
    />
  )
}

export function ReplayerHighlights() {
  const { highlightedSelector, replayer } = useDebuggerHighlight()
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)
  const idCounter = useRef(0)

  useEffect(() => {
    if (highlightedSelector === null || replayer === null) {
      setHighlights(null)
      return
    }

    const iframe = replayer.iframe

    if (!iframe || !iframe.contentDocument) {
      setHighlights(null)
      return
    }

    try {
      const elements = iframe.contentDocument.querySelectorAll(
        highlightedSelector.selector
      )

      const newHighlights = Array.from(elements).map((element) => {
        const bounds = getElementBounds(element)

        return {
          id: idCounter.current++,
          bounds,
        }
      })

      setHighlights(newHighlights)
    } catch {
      setHighlights([])
    }
  }, [highlightedSelector, replayer])

  if (highlights === null) {
    return null
  }

  return (
    <>
      {highlights.map((highlight) => (
        <ElementOutline key={highlight.id} bounds={highlight.bounds} />
      ))}
    </>
  )
}
