import { css } from '@emotion/react'
import { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  /** Stronger fill and text for emphasis (e.g. when count is non-zero). */
  highContrast?: boolean
}

export function Badge({ children, highContrast = false }: BadgeProps) {
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25em;
        padding: 0 var(--studio-spacing-1);
        border-radius: 9999px;
        font-size: var(--studio-font-size-1);
        font-weight: var(--studio-font-weight-medium);
        line-height: 1.25;
        font-variant-numeric: tabular-nums;
        ${highContrast
          ? css`
              background-color: var(--gray-12);
              color: var(--gray-1);
            `
          : css`
              background-color: var(--gray-a4);
              color: var(--gray-11);
            `}
      `}
    >
      {children}
    </span>
  )
}
