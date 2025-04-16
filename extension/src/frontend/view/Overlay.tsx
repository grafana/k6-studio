import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

import { Bounds } from './types'

interface OverlayProps extends ComponentProps<'div'> {
  bounds: Bounds
}

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay({ bounds, ...props }, ref) {
    return (
      <div
        ref={ref}
        css={css`
          position: fixed;
          pointer-events: none;
        `}
        style={{
          ...bounds,
        }}
        {...props}
      />
    )
  }
)
