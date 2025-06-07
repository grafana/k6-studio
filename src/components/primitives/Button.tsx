import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

const styles = css`
  border: none;
  border-radius: 4px;
  font-size: var(--studio-font-size-2);
  font-weight: var(--studio-font-weight-medium);
  padding: var(--studio-spacing-2) var(--studio-spacing-3);
  color: var(--studio-accent-contrast);
  background-color: rgba(0, 0, 0, 0);

  &:hover {
    background-color: var(--studio-accent-10);
  }

  &:where([data-size='1']) {
    font-size: var(--studio-font-size-1);
    padding: var(--studio-spacing-1) var(--studio-spacing-2);
  }

  &[data-variant='solid'] {
    background-color: var(--studio-accent-9);
    color: var(--studio-accent-contrast);
  }

  &[data-variant='outline'] {
    box-shadow: inset 0 0 0 1px var(--studio-accent-a8);
    color: var(--studio-accent-a11);

    &:hover {
      background-color: var(--studio-accent-a2);
    }
  }
`

type ButtonProps = ComponentProps<'button'> & {
  size?: '1' | '2'
  variant?: 'solid' | 'outline'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ size = '2', variant = 'solid', ...props }, ref) {
    return (
      <button
        ref={ref}
        css={styles}
        data-variant={variant}
        data-size={size}
        {...props}
      ></button>
    )
  }
)
