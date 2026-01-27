import { css } from '@emotion/react'
import { ReactNode, useLayoutEffect, useState } from 'react'

export function useViewportScale(mount: HTMLElement | null) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (mount === null || mount.parentElement === null) {
      return
    }

    const scaleToFitParent = (target: HTMLElement) => {
      if (target.parentElement === null) {
        return
      }

      const parentWidth = target.parentElement.clientWidth
      const parentHeight = target.parentElement.clientHeight

      const elementWidth = target.offsetWidth
      const elementHeight = target.offsetHeight

      const scaleX = parentWidth / elementWidth
      const scaleY = parentHeight / elementHeight

      const scale = Math.min(scaleX, scaleY, 1)

      setScale(scale)
    }

    scaleToFitParent(mount)

    const observer = new ResizeObserver(() => {
      scaleToFitParent(mount)
    })

    observer.observe(mount.parentElement)
    observer.observe(mount)

    return () => {
      observer.disconnect()
    }
  }, [mount])

  return scale
}

interface ViewportProps {
  show: boolean
  children: ReactNode
}

export function Viewport({ show, children }: ViewportProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)

  const scale = useViewportScale(viewport)

  return (
    <div
      ref={setViewport}
      css={css`
        display: ${!show ? 'none' : 'block'};
        position: absolute;
        left: 50%;
        top: 50%;
        transform: scale(${scale}) translate(-50%, -50%);
        transform-origin: top left;
        border: 1px solid var(--gray-a5);
      `}
    >
      {children}
    </div>
  )
}
