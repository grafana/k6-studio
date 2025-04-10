import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

import { Overlay } from './Overlay'
import { useHighlightedElements } from './RemoteHighlights.hooks'
import { Bounds } from './types'

const Backdrop = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  function Backdrop(props, ref) {
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
  }
)

interface ElementHighlightProps extends ComponentProps<'div'> {
  bounds: Bounds
}

const ElementCutout = forwardRef<HTMLDivElement, ElementHighlightProps>(
  function ElementCutout(props, ref) {
    return (
      <Overlay
        ref={ref}
        css={css`
          z-index: var(--studio-layer-0);
          background-color: white;
        `}
        {...props}
      />
    )
  }
)

const ElementOutline = forwardRef<HTMLDivElement, ElementHighlightProps>(
  function ElementOutline(props, ref) {
    return (
      <Overlay
        ref={ref}
        css={css`
          z-index: var(--studio-layer-0);
          outline: 2px solid var(--gray-12);
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
  const bounds = useHighlightedElements()

  if (bounds === null) {
    return null
  }

  return (
    <>
      <Backdrop>
        {bounds.map((bound, index) => {
          return <ElementCutout key={index} bounds={bound} />
        })}
      </Backdrop>
      {bounds.map((bound, index) => {
        return <ElementOutline key={index} bounds={bound} />
      })}
    </>
  )
}
