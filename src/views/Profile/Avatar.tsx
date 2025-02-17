import { css } from '@emotion/react'
import { PersonIcon } from '@radix-ui/react-icons'

export function Avatar() {
  return (
    <div
      css={css`
        width: 100px;
        height: 100px;
        padding: var(--space-6);
        border: 4px solid var(--accent-9);
        color: var(--accent-9);
        border-radius: 50%;
      `}
    >
      <PersonIcon width="100%" height="100%" />
    </div>
  )
}
