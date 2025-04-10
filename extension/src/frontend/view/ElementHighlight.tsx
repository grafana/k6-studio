import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

import { Overlay } from './Overlay'
import { Bounds } from './types'

export const ElementHighlightBackdrop = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'>
>(function ElementHighlightBackdrop(props, ref) {
  return (
    <div
      ref={ref}
      css={css`
        position: fixed;
        inset: 0;
        z-index: var(--studio-layer-0);
        background-color: rgba(0, 0, 0, 0.4);
        mix-blend-mode: darken;
        pointer-events: none;
      `}
      {...props}
    />
  )
})

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
        background-color: white;
        outline: 1px solid var(--gray-6);
      `}
      bounds={bounds}
    />
  )
})
