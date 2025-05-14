import { css } from '@emotion/react'
import { forwardRef } from 'react'

import { Position } from './types'

interface AnchorProps {
  position: Position
}

export const Anchor = forwardRef<HTMLDivElement, AnchorProps>(function Anchor(
  { position },
  ref
) {
  return (
    <div
      ref={ref}
      css={css`
        position: absolute;
        pointer-events: none;
        width: 1px;
        height: 1px;
      `}
      style={position}
    />
  )
})
