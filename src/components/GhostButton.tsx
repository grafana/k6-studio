import { css } from '@emotion/react'
import { Button, ButtonProps } from '@radix-ui/themes'
import { forwardRef } from 'react'

type GhostButtonProps = Omit<ButtonProps, 'variant'>

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  function GhostButton(props, ref) {
    return (
      <Button
        ref={ref}
        css={css`
          margin: 0;
          height: var(--base-button-height);

          --button-ghost-padding-x: var(--space-3);
          --button-ghost-padding-y: 0;
        `}
        {...props}
        variant="ghost"
      />
    )
  }
)
