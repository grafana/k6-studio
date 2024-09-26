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

  return hasOverflow
}
