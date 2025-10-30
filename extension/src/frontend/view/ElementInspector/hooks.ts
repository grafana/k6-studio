import { last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { client } from '../../routing'

import { toTrackedElement, TrackedElement } from './utils'

export function usePinnedElement(element?: TrackedElement | undefined) {
  const [elements, setElements] = useState<TrackedElement[]>(
    element !== undefined ? [element] : []
  )

  const pin = useCallback((element: TrackedElement) => {
    setElements([element])
  }, [])

  const unpin = useCallback(() => {
    setElements([])
  }, [])

  const expand = useMemo(() => {
    const [head] = elements

    if (head === undefined) {
      return undefined
    }

    const parent = head.target.parentElement

    if (parent === null || parent === document.documentElement) {
      return undefined
    }

    return () => {
      setElements((pinned) => {
        return [toTrackedElement(parent), ...pinned]
      })
    }
  }, [elements])

  const contract = useMemo(() => {
    const [head, ...tail] = elements

    // If head is undefined, that means no element is pinned. If tail is
    // empty, that means we're back at the intial element. In either case
    // we can't decrease the selection any further.
    if (head === undefined || tail.length === 0) {
      return undefined
    }

    return () => {
      setElements(tail)
    }
  }, [elements])

  return {
    pinned: last(elements) ?? null,
    selected: elements[0] ?? null,
    pin,
    unpin,
    expand,
    contract,
  }
}

export function useElementHighlight(element: TrackedElement | null) {
  useEffect(() => {
    client.send({
      type: 'highlight-elements',
      selector: element && {
        type: 'css',
        selector: element.selector.css,
      },
    })
  }, [element])

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])
}
