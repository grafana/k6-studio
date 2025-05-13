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
  background-clip: content-box;
  box-shadow: var(--studio-input-box-shadow);
  box-sizing: border-box;
  border-radius: var(--studio-input-border-radius);
  min-height: var(--studio-input-height);

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

  &:where([data-size='1']) {
    --studio-input-font-size: var(--studio-font-size-1);
    --studio-input-padding: calc(var(--studio-spacing-1) * 1.5);
    --studio-input-height: var(--studio-spacing-6);
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
    <div className={clsx('input', className)} css={styles} data-size={size}>
      <input ref={ref} {...props}></input>
    </div>
  )
})
