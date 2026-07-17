import { last } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { emptyToUndefined } from '@/utils/list'

import { getCssFramePathForElement } from '../../frames'
import { useStudioClient } from '../StudioClientProvider'

import {
  expandRemoteTrackedElement,
  getTarget,
  InspectedElement,
  LiveTrackedElement,
  toRemoteFrames,
  toTrackedElement,
} from './utils'

/** Whether `head` has an ancestor left to expand into, without materializing it. */
function canExpand(head: InspectedElement): boolean {
  if (head.kind === 'remote') {
    return head.ancestors.length > 0
  }

  const parent = head.element.parentElement

  // Use the element's own document so expansion stops correctly for elements
  // inside iframes, not just the top document.
  return parent !== null && parent !== parent.ownerDocument.documentElement
}

/** Expands `head` to its next ancestor, or undefined at the top of the chain. */
function expandOnce(head: InspectedElement): InspectedElement | undefined {
  if (head.kind === 'remote') {
    return expandRemoteTrackedElement(head)
  }

  const parent = head.element.parentElement

  if (parent === null || parent === parent.ownerDocument.documentElement) {
    return undefined
  }

  return toTrackedElement(parent)
}

export function usePinnedElement<
  T extends InspectedElement = LiveTrackedElement,
>(element?: T) {
  const [elements, setElements] = useState<T[]>(
    element !== undefined ? [element] : []
  )

  const pin = useCallback((element: T) => {
    setElements([element])
  }, [])

  const unpin = useCallback(() => {
    setElements([])
  }, [])

  const expand = useMemo(() => {
    const [head] = elements

    if (head === undefined || !canExpand(head)) {
      return undefined
    }

    return () => {
      setElements((pinned) => {
        const [current] = pinned
        const next = current === undefined ? undefined : expandOnce(current)

        if (next === undefined) {
          return pinned
        }

        // A live head only ever expands into another live element, and a
        // remote head only into another remote one, so `next` always matches
        // `T`. The switch above narrows on the plain `InspectedElement`
        // union, not on the generic `T` itself, so TypeScript can't verify
        // that correspondence here.
        return [next as T, ...pinned]
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

export function useElementHighlight(element: InspectedElement | null) {
  const client = useStudioClient()

  // The frame chain is the same for every element in a given document, and
  // computing it runs an expensive selector generation on each ancestor iframe,
  // so memoize it per owner document. Any element in the document yields the
  // same chain, so it is computed from the document element. The chain of iframe
  // CSS selectors lets the highlight resolve into the right frame. Remote
  // elements have no live document to walk; their frame path was captured by
  // the relay and is mapped separately below.
  const ownerDocument =
    element?.kind === 'live' ? element.element.ownerDocument : null

  const liveFrames = useMemo(
    () =>
      ownerDocument === null
        ? undefined
        : emptyToUndefined(
            getCssFramePathForElement(ownerDocument.documentElement)
          ),
    [ownerDocument]
  )

  const remoteFramePath = element?.kind === 'remote' ? element.framePath : null
  const remoteFrames = useMemo(
    () => toRemoteFrames(remoteFramePath),
    [remoteFramePath]
  )

  const frames = element?.kind === 'remote' ? remoteFrames : liveFrames

  useEffect(() => {
    const target = element === null ? null : getTarget(element)

    client.send({
      type: 'highlight-elements',
      locator: target && {
        type: 'css',
        selector: target.selectors.css,
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
