import { css } from '@emotion/react'
import { ComponentProps, forwardRef, ReactNode, useId } from 'react'

import { Input } from './Input'
import { Label } from './Label'

const styles = css`
  display: flex;
  gap: var(--studio-spacing-2);
  align-items: baseline;
`

type TextFieldProps = ComponentProps<typeof Input> & {
  label: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, size, label, ...props }, ref) {
    const generatedId = useId()

    return (
      <div className="studio-text-field" css={styles}>
        <Label size={size} htmlFor={id ?? generatedId}>
          {label}
        </Label>
        <Input ref={ref} id={id ?? generatedId} size={size} {...props} />
      </div>
    )
  }
)
