import { css } from '@emotion/react'

import LogoGradient from '@/assets/logo-gradient.svg'

export function ToolBoxLogo() {
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
          width: 16px;
          height: 16px;
        `}
        src={LogoGradient}
        alt="k6 Studio"
      />
    </div>
  )
}
