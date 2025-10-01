import { css } from '@emotion/react'
import { clsx } from 'clsx'
import { ComponentProps, forwardRef } from 'react'

const styles = css`
  --studio-input-font-size: var(--studio-font-size-2);
  --studio-input-padding: var(--studio-spacing-2);
  --studio-input-height: var(--studio-spacing-8);
  --studio-input-border-radius: 4px;

  display: flex;
  align-items: stretch;

  > input {
    border: none;
    border-radius: var(--studio-input-border-radius);
    background-color: transparent;
    padding: 0 var(--studio-input-padding);
    width: 100%;
    font-family: var(--studio-font-family);
    font-size: var(--studio-input-font-size);
    color-scheme: var(--studio-color-scheme);
    color: var(--studio-input-color);
  }
`

type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  size?: '1' | '2'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size = '2', ...props },
  ref
) {
  return (
    <div
      className={clsx('studio-input', className)}
      css={styles}
      data-size={size}
    >
      <input ref={ref} {...props}></input>
    </div>
  )
})
