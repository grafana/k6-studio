import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

import { NodeSelector } from '@/schemas/selectors'

import { useHighlightedElements } from './ElementHighlights.hooks'
import { Overlay } from './Overlay'
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
          box-sizing: border-box;
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

interface ElementHighlightsProps {
  element: HTMLElement | null
  selector: NodeSelector | null
}

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function ElementHighlights({
  element,
  selector,
}: ElementHighlightsProps) {
  const highlights = useHighlightedElements(element, selector)

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
