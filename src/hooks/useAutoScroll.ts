import { useEffect, useRef } from 'react'

export function useAutoScroll(items: unknown, enabled = true) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bottomRef.current || !enabled) return

    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items, enabled])

  return bottomRef
}
