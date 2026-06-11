import { last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { emptyToUndefined } from '@/utils/list'

import { getCssFramePathForElement } from '../../frames'
import { useStudioClient } from '../StudioClientProvider'

import { toTrackedElement, TrackedElement } from './utils'

export function usePinnedElement(element?: TrackedElement) {
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

    const parent = head.element.parentElement

    // Use the element's own document so expansion stops correctly for elements
    // inside iframes, not just the top document.
    if (parent === null || parent === parent.ownerDocument.documentElement) {
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
  const client = useStudioClient()

  // The frame chain is the same for every element in a given document, and
  // computing it runs an expensive selector generation on each ancestor iframe,
  // so memoize it per owner document. Any element in the document yields the
  // same chain, so it is computed from the document element. The chain of iframe
  // CSS selectors lets the highlight resolve into the right frame.
  const ownerDocument = element?.element.ownerDocument ?? null
  const frames = useMemo(
    () =>
      ownerDocument === null
        ? undefined
        : emptyToUndefined(
            getCssFramePathForElement(ownerDocument.documentElement)
          ),
    [ownerDocument]
  )

  useEffect(() => {
    client.send({
      type: 'highlight-elements',
      locator: element && {
        type: 'css',
        selector: element.target.selectors.css,
      },
      frames,
    })
  }, [client, element, frames])

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        locator: null,
      })
    }
  }, [client])
}
