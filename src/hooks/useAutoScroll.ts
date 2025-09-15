import { MutableRefObject, useEffect, useRef } from 'react'

export function useAutoScroll<Element extends HTMLElement = HTMLDivElement>(
  items: unknown,
  enabled = true
): MutableRefObject<Element | null> {
  const bottomRef = useRef<Element>(null)

  useEffect(() => {
    if (!bottomRef.current || !enabled) return

    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items, enabled])

  return bottomRef
}
