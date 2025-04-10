import { useEffect, useState } from 'react'

import { ElementSelector } from '@/schemas/recording'

import { generateSelector } from '../../selectors'

import { useGlobalClass } from './GlobalStyles'
import { useHighlightDebounce } from './hooks/useHighlightDebounce'
import { usePreventClick } from './hooks/usePreventClick'
import { Bounds } from './types'

interface TrackedElement {
  selector: ElementSelector
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

  usePreventClick(element !== null)
  useGlobalClass('inspecting')

  return useHighlightDebounce(element)
}
