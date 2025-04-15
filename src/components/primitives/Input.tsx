import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

const styles = css`
  --studio-input-font-size: var(--studio-font-size-2);
  --studio-input-padding: var(--studio-spacing-2);
  --studio-input-height: var(--studio-spacing-8);
  --studio-input-border-radius: 4px;

  display: flex;
  align-items: stretch;
  background-clip: content-box;
  box-shadow: inset 0 0 0 1px var(--gray-a7);
  box-sizing: border-box;
  border-radius: var(--studio-input-border-radius);
  height: var(--studio-input-height);

  > input {
    border: none;
    border-radius: var(--studio-input-border-radius);
    background-color: transparent;
    padding: 0 var(--studio-input-padding);
    width: 100%;
    font-family: var(--studio-font-family);
    font-size: var(--studio-input-font-size);
    color-scheme: var(--studio-color-scheme);
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
  { size = '2', ...props },
  ref
) {
  return (
    <div css={styles} data-size={size}>
      <input ref={ref} {...props}></input>
    </div>
  )
})
