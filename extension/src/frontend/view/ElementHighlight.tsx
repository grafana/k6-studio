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
        z-index: var(--studio-layer-0);
        outline: 2px solid var(--gray-12);

        &:after {
          content: ' ';
          display: block;
          position: absolute;
          inset: 0;
          // This will darken everything around the highlighted element
          // giving a sense of a cutout.
          outline: 10000px solid rgba(0, 0, 0, 0.4);
        }
      `}
      bounds={bounds}
    />
  )
})
