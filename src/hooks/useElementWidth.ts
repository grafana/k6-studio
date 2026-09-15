import { useEffect, useState } from 'react'

/**
 * Tracks an element's width via ResizeObserver. Returns null until the first
 * measurement; 0 afterwards means the element is actually hidden.
 */
export function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    const measure = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth)
      }
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    const currentRef = ref.current
    if (currentRef) {
      resizeObserver.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef)
      }
    }
  }, [ref])

  return width
}
