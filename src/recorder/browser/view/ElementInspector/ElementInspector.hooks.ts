import { useCallback, useEffect, useRef, useState } from 'react'

import { Bounds, Position } from '@/components/Browser/types'
import { isHTMLIFrameElement } from '@/utils/dom/realm'

import { toTopFramePosition } from '../frameGeometry'
import { useGlobalClass } from '../GlobalStyles'
import { useHighlightDebounce } from '../hooks/useHighlightDebounce'
import { usePreventClick } from '../hooks/usePreventClick'

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

  const reset = useCallback(() => {
    setMousePosition({
      top: 0,
      left: 0,
    })

    unpin()
  }, [unpin])

  const pinElement = useCallback(
    (element: Element, position: Position) => {
      const tracked = toTrackedElement(element)

      // In certain cases the mouse position is outside the bounds of the hovered
      // element, e.g. when the last hovered element was the `body` element.
      // Showing the menu when clicking outside the bounds is very confusing
      // because you have no idea what element the menu is for.
      if (!isInsideBounds(position, tracked.bounds)) {
        return
      }

      setMousePosition(position)
      pin(tracked)
    },
    [pin]
  )

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

      // The inspector running inside the iframe reports the element under the
      // cursor, so don't highlight the iframe element itself (and skip the
      // expensive selector computation it would require). Clear the hover so a
      // prior in-frame highlight can't linger over the iframe's own surface.
      if (isHTMLIFrameElement(target)) {
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

  usePreventClick({
    callback: (ev) => {
      if (hoveredEl === null) {
        return
      }

      if (pinned !== null) {
        reset()

        return
      }

      pinElement(hoveredEl.element, {
        top: ev.clientY + window.scrollY,
        left: ev.clientX + window.scrollX,
      })
    },
    dependencies: [pinned, hoveredEl, reset, pinElement],
  })

  // Detection inside iframes runs in the child frames (see
  // attachInspectionDetection) and reports back through this bridge with the
  // live element reference. We delegate through refs so the bridge object stays
  // stable while still seeing the latest state.
  const hoverRef = useRef<(element: Element) => void>(() => {})
  const pickRef = useRef<
    (element: Element, clientX: number, clientY: number) => void
  >(() => {})

  hoverRef.current = (element) => {
    setHoveredEl(toTrackedElement(element))
  }

  pickRef.current = (element, clientX, clientY) => {
    if (pinned !== null) {
      reset()

      return
    }

    pinElement(
      element,
      toTopFramePosition(element.ownerDocument.defaultView, clientX, clientY)
    )
  }

  useEffect(() => {
    window.__K6_STUDIO_INSPECTION__ = {
      hover: (element) => hoverRef.current(element),
      pick: (element, clientX, clientY) =>
        pickRef.current(element, clientX, clientY),
    }

    return () => {
      delete window.__K6_STUDIO_INSPECTION__
    }
  }, [])

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
