import { useEffect, useRef } from 'react'

export function useScrollIntoView<E extends Element = Element>(
  selected: boolean
) {
  const elementRef = useRef<E | null>(null)

  useEffect(() => {
    if (!selected) {
      return
    }

    elementRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
    })
  }, [selected])

  return elementRef
}
