import { css } from '@emotion/react'
import { forwardRef } from 'react'

import { Bounds } from './types'

interface ElementHighlightProps {
  bounds: Bounds
  visible?: boolean
}

export const ElementHighlight = forwardRef<
  HTMLDivElement,
  ElementHighlightProps
>(function ElementHighlight({ bounds, visible = true }, ref) {
  return (
    <div
      ref={ref}
      data-visible={visible}
      css={css`
        position: fixed;
        pointer-events: none;

        &[data-visible='true'] {
          background-color: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0);
          z-index: var(--studio-layer-0);
        }
      `}
      style={{
        ...bounds,
      }}
    />
  )
})
