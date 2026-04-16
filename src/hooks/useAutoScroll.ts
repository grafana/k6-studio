import { RefObject, useEffect, useRef } from 'react'

export function useAutoScroll<Element extends HTMLElement = HTMLDivElement>(
  items: unknown,
  enabled = true
): RefObject<Element | null> {
  const bottomRef = useRef<Element>(null)

  useEffect(() => {
    if (!bottomRef.current || !enabled) return

    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items, enabled])

  return bottomRef
}
