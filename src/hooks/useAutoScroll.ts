import { useEffect, useRef } from 'react'

export function useAutoScroll(items: unknown) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bottomRef.current) return

    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items])

  return bottomRef
}
