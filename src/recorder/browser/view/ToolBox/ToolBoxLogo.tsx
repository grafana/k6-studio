import { css } from '@emotion/react'

import LogoGradient from '@/assets/logo-gradient.svg'

interface ToolBoxLogoProps {
  size?: number
}

export function ToolBoxLogo({ size = 16 }: ToolBoxLogoProps) {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        padding: var(--studio-spacing-1);
      `}
    >
      <img
        css={css`
          width: ${size}px;
          height: ${size}px;
        `}
        src={LogoGradient}
        alt="k6 Studio"
      />
    </div>
  )
}
