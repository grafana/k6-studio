import { last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ElementSelector } from '@/schemas/recording'

import { generateSelector } from '../../selectors'

import { useGlobalClass } from './GlobalStyles'
import { useHighlightDebounce } from './hooks/useHighlightDebounce'
import { usePreventClick } from './hooks/usePreventClick'
import { Bounds, Position } from './types'
import { getElementBounds } from './utils'

export interface TrackedElement {
  selector: ElementSelector
  target: Element
  bounds: Bounds
}

function toTrackedElement(element: Element): TrackedElement {
  return {
    selector: generateSelector(element),
    target: element,
    bounds: getElementBounds(element),
  }
}

export function useInspectedElement() {
  const [mousePosition, setMousePosition] = useState<Position>({
    top: 0,
    left: 0,
  })
  const [pinnedEl, setPinnedElement] = useState<TrackedElement[]>([])
  const [hoveredEl, setHoveredEl] = useState<TrackedElement | null>(null)

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

        setHoveredEl(null)

        return
      }

      setHoveredEl(toTrackedElement(target))
    }

    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [pinnedEl])

  useEffect(() => {
    if (hoveredEl === null) {
      return
    }

    const handleScroll = () => {
      setHoveredEl(null)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hoveredEl])

  usePreventClick({
    callback: (ev) => {
      if (hoveredEl === null) {
        return
      }

      if (pinnedEl.length > 0) {
        console.log('unpinning')
        setMousePosition({
          top: 0,
          left: 0,
        })
        setPinnedElement([])

        return
      }

      setMousePosition({
        top: ev.clientY + window.scrollY,
        left: ev.clientX + window.scrollX,
      })

      setPinnedElement([hoveredEl])
    },
    dependencies: [pinnedEl, hoveredEl],
  })

  useGlobalClass('inspecting')

  const unpin = useCallback(() => {
    setPinnedElement([])
  }, [])

  useEffect(() => {
    return () => {
      setPinnedElement([])
      setHoveredEl(null)
    }
  }, [unpin])

  const expand = useMemo(() => {
    const [head] = pinnedEl

    if (head === undefined) {
      return undefined
    }

    const parent = head.target.parentElement

    if (parent === null || parent === document.documentElement) {
      return undefined
    }

    return () => {
      setPinnedElement((pinned) => {
        return [toTrackedElement(parent), ...pinned]
      })
    }
  }, [pinnedEl])

  const contract = useMemo(() => {
    const [head, ...tail] = pinnedEl

    // If head is undefined, that means no element is pinned. If tail is
    // empty, that means we're back at the intial element. In either case
    // we can't decrease the selection any further.
    if (head === undefined || tail.length === 0) {
      return undefined
    }

    return () => {
      setPinnedElement(tail)
    }
  }, [pinnedEl])

  const highlightedEl = useHighlightDebounce(hoveredEl)

  return {
    pinned: last(pinnedEl) ?? null,
    element: pinnedEl[0] ?? highlightedEl,
    mousePosition,
    unpin,
    expand,
    contract,
  }
}
