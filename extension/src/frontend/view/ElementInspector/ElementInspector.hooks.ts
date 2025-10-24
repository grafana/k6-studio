import { last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ElementSelector } from '@/schemas/recording'
import { uuid } from '@/utils/uuid'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { generateSelectors } from '../../../selectors'
import { useGlobalClass } from '../GlobalStyles'
import { useHighlightDebounce } from '../hooks/useHighlightDebounce'
import { usePreventClick } from '../hooks/usePreventClick'
import { Bounds, Position } from '../types'
import { getElementBounds } from '../utils'

function* getAncestors(element: Element) {
  let current: Element | null = element.parentElement

  while (current !== null) {
    yield current

    if (current === document.documentElement) {
      break
    }

    current = current.parentElement
  }
}

function findLabelFor(label: HTMLLabelElement): Element | null {
  const id = label.getAttribute('for')

  if (id === null) {
    return null
  }

  return document.getElementById(id)
}

function findInChildren(label: HTMLLabelElement): Element | null {
  return label.querySelector('input, select, textarea')
}

function findLabelledBy(label: HTMLLabelElement): Element | null {
  if (label.id === '') {
    return null
  }

  return document.querySelector(`[aria-labelledby="${label.id}"]`)
}

export function findRelatedInput(element: Element): TrackedElement | null {
  const label = [...getAncestors(element)].find(
    (ancestor) => ancestor instanceof HTMLLabelElement
  )

  if (label === undefined) {
    return null
  }

  const input =
    findLabelFor(label) ?? findInChildren(label) ?? findLabelledBy(label)

  if (input === null) {
    return null
  }

  return toTrackedElement(input)
}

export interface TrackedElement {
  id: string
  roles: ElementRole[]
  selector: ElementSelector
  target: Element
  bounds: Bounds
}

function toTrackedElement(element: Element): TrackedElement {
  const roles = getElementRoles(element)

  return {
    id: uuid(),
    roles: [...roles],
    selector: generateSelectors(element),
    target: element,
    bounds: getElementBounds(element),
  }
}

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
  const [pinnedEl, setPinnedElement] = useState<TrackedElement[]>([])
  const [hoveredEl, setHoveredEl] = useState<TrackedElement | null>(null)

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

  const unpin = useCallback(() => {
    setMousePosition({
      top: 0,
      left: 0,
    })

    setPinnedElement([])
  }, [])

  usePreventClick({
    callback: (ev) => {
      if (hoveredEl === null) {
        return
      }

      if (pinnedEl.length > 0) {
        unpin()

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
      setPinnedElement([hoveredEl])
    },
    dependencies: [pinnedEl, hoveredEl, unpin],
  })

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
