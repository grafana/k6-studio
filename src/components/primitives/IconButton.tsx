import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

const styles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: var(--studio-foreground);
  background-color: var(--studio-toggle-bg-off);
  border: none;
  padding: var(--studio-spacing-1);

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover {
    background-color: var(--studio-toggle-bg-on);
  }
`

type IconButtonProps = ComponentProps<'button'>

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ ...props }, ref) {
    return <button ref={ref} css={styles} {...props}></button>
  }
)
