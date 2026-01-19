import { useLayoutEffect, useState } from 'react'

export function useViewportScale(mount: HTMLElement | null) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (mount === null || mount.parentElement === null) {
      return
    }

    const scaleToFitParent = (parent: Element) => {
      const parentWidth = parent.clientWidth
      const parentHeight = parent.clientHeight

      const elementWidth = mount.offsetWidth
      const elementHeight = mount.offsetHeight

      const scaleX = parentWidth / elementWidth
      const scaleY = parentHeight / elementHeight

      const scale = Math.min(scaleX, scaleY, 1)

      setScale(scale)
    }

    scaleToFitParent(mount.parentElement)

    const observer = new ResizeObserver(([mutation]) => {
      if (mutation === undefined) {
        return
      }

      scaleToFitParent(mutation.target)
    })

    observer.observe(mount.parentElement)

    return () => {
      observer.disconnect()
    }
  }, [mount])

  return scale
}
