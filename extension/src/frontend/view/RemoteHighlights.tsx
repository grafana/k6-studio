import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

import { Overlay } from './Overlay'
import { useHighlightedElements } from './RemoteHighlights.hooks'
import { Bounds } from './types'

interface ElementHighlightProps extends ComponentProps<'div'> {
  bounds: Bounds
}

const ElementOutline = forwardRef<HTMLDivElement, ElementHighlightProps>(
  function ElementOutline(props, ref) {
    return (
      <Overlay
        ref={ref}
        css={css`
          z-index: var(--studio-layer-0);
          border: 2px solid var(--gray-6);
          outline: 2px solid var(--gray-12);
          outline-offset: 2px;
          background-color: var(--blue-a3);
        `}
        {...props}
      />
    )
  }
)

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function RemoteHighlights() {
  const highlights = useHighlightedElements()

  if (highlights === null) {
    return null
  }

  return (
    <>
      {highlights.map((highlight) => {
        return <ElementOutline key={highlight.id} bounds={highlight.bounds} />
      })}
    </>
  )
}
