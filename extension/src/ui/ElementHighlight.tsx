import { css } from '@emotion/react'
import { Bounds } from './types'
import { forwardRef } from 'react'

interface ElementHighlightProps {
  bounds: Bounds
}

export const ElementHighlight = forwardRef<
  HTMLDivElement,
  ElementHighlightProps
>(function ElementHighlight({ bounds }, ref) {
  return (
    <div
      ref={ref}
      css={css`
        position: fixed;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0);
        z-index: 9999999999;
      `}
      style={{
        ...bounds,
      }}
    />
  )
})
