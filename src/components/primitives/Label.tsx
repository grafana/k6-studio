import { css } from '@emotion/react'
import { ComponentProps, forwardRef } from 'react'

const styles = css`
  font-size: var(--studio-font-size-2);

  &:where([data-size='1']) {
    font-size: var(--studio-font-size-1);
  }
`

type LabelProps = ComponentProps<'label'> & {
  size?: '1' | '2'
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { size = '2', ...props },
  ref
) {
  return <label ref={ref} css={styles} data-size={size} {...props}></label>
})
