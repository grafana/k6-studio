import { useEffect, useState } from 'react'

export function useOverflowCheck(ref: React.RefObject<HTMLElement>) {
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      if (ref.current) {
        const { scrollWidth, clientWidth } = ref.current
        setHasOverflow(scrollWidth > clientWidth)
      }
    }

    checkOverflow()

    const resizeObserver = new ResizeObserver(checkOverflow)
    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current)
      }
    }
  }, [ref])

  return hasOverflow
}
