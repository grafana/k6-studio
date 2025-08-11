import { css } from '@emotion/react'
import { clsx } from 'clsx'
import { ComponentProps } from 'react'

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'size'> & {
  size?: '1' | '2'
}

export function TextArea({ className, size, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={clsx('studio-input', className)}
      data-size={size}
      css={css`
        color: var(--studio-input-color);
        font-family: var(--studio-font-family);
        font-size: var(--studio-input-font-size);
        padding: var(--studio-input-padding);
        border: none;
        background-color: transparent;
        border-radius: var(--studio-input-border-radius);
        background-clip: content-box;
        box-shadow: var(--studio-input-box-shadow);
        box-sizing: border-box;
      `}
    />
  )
}
