import { css } from '@emotion/react'
import { forwardRef } from 'react'

import { Overlay } from './Overlay'
import { Bounds } from './types'

interface ElementHighlightProps {
  bounds: Bounds
}

export const ElementHighlight = forwardRef<
  HTMLDivElement,
  ElementHighlightProps
>(function ElementHighlight({ bounds }, ref) {
  return (
    <Overlay
      ref={ref}
      css={css`
        background-color: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0);
        z-index: var(--studio-layer-0);
      `}
      bounds={bounds}
    />
  )
})
