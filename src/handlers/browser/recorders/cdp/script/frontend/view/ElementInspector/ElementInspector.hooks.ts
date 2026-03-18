import { useCallback, useEffect, useState } from 'react'

import { useGlobalClass } from '../GlobalStyles'
import { useHighlightDebounce } from '../hooks/useHighlightDebounce'
import { usePreventClick } from '../hooks/usePreventClick'
import { Bounds, Position } from '../types'

import { usePinnedElement } from './hooks'
import { toTrackedElement, TrackedElement } from './utils'

function isInsideBounds(
  position: Position,
  { top, left, width, height }: Bounds
) {
  const right = left + width
  const bottom = top + height

  return (
    position.top >= top &&
    position.left >= left &&
    position.left <= right &&
    position.top <= bottom
  )
}

export function useInspectedElement() {
  const [mousePosition, setMousePosition] = useState<Position>({
    top: 0,
    left: 0,
  })

  /**
   * We track elements in two different ways:
   *
   * 1. The hovered element is the element that the mouse is currently over. It's
   *    only tracked as long as the user hasn't pinned an element.
   * 2. The pinned element is a stack of element where the first element is the
   *    currently selected element. Elements are added to the stack when the expand
   *    the selection and removed when the user contracts the selection. If the
   *    stack is empty, then no element is pinned.
   */
  const [hoveredEl, setHoveredEl] = useState<TrackedElement | null>(null)

  const { selected, pinned, pin, unpin, expand, contract } = usePinnedElement()

  useGlobalClass('inspecting')

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
  }, [])

  const reset = useCallback(() => {
    setMousePosition({
      top: 0,
      left: 0,
    })

    unpin()
  }, [unpin])

  usePreventClick({
    callback: (ev) => {
      if (hoveredEl === null) {
        return
      }

      if (pinned !== null) {
        reset()

        return
      }

      const position = {
        top: ev.clientY + window.scrollY,
        left: ev.clientX + window.scrollX,
      }

      // In certain cases the mouse position is outside the bounds of
      // the hovered element, e.g. when the last hovered element was
      // the `body` element. Showing the menu when clicking outside
      // the bounds is very confusing because you have no idea what
      // element the menu is for.
      if (!isInsideBounds(position, hoveredEl.bounds)) {
        return
      }

      setMousePosition(position)
      pin(hoveredEl)
    },
    dependencies: [pinned, hoveredEl, unpin],
  })

  const highlightedEl = useHighlightDebounce(hoveredEl)

  return {
    pinned,
    element: selected ?? highlightedEl,
    mousePosition,
    reset,
    expand,
    contract,
  }
}
