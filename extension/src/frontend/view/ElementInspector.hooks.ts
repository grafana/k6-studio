import { useEffect, useState } from 'react'

import { generateSelector } from '../../selectors'

import { useGlobalClass } from './hooks/useGlobalClass'
import { Bounds } from './types'

interface TrackedElement {
  selector: string
  target: Element
  bounds: Bounds
}

export function useInspectedElement() {
  const [element, setInspectedElement] = useState<TrackedElement | null>(null)

  useEffect(() => {
    const handleMouseOver = (ev: MouseEvent) => {
      const [target] = ev.composedPath()

      if (target instanceof Element === false) {
        return
      }

      const root = target.getRootNode()

      if (root instanceof ShadowRoot) {
        // Disable the highlight when over any in-browser ui element _except_
        // for the selector tooltip so that the user can copy its value.
        if (target.hasAttribute('data-inspector-tooltip')) {
          return
        }

        setInspectedElement(null)

        return
      }

      const { top, left, width, height } = target.getBoundingClientRect()

      setInspectedElement({
        selector: generateSelector(target),
        target: target,
        bounds: {
          top,
          left,
          width,
          height,
        },
      })
    }

    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  useEffect(() => {
    if (element === null) {
      return
    }

    const captureClick = (ev: MouseEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
    }

    window.addEventListener('click', captureClick, { capture: true })

    return () => {
      window.removeEventListener('click', captureClick, { capture: true })
    }
  }, [element])

  useGlobalClass('ksix-studio-inspecting')

  return element
}
