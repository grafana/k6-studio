import { css } from '@emotion/react'
import { forwardRef, ReactNode } from 'react'

import { Bounds } from './types'

interface OverlayProps {
  className?: string
  bounds: Bounds
  children?: ReactNode
}

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay({ className, bounds, children }, ref) {
    return (
      <div
        ref={ref}
        className={className}
        css={css`
          position: fixed;
          pointer-events: none;
        `}
        style={{
          ...bounds,
        }}
      >
        {children}
      </div>
    )
  }
)
