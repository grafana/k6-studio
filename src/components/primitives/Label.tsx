import { ComponentProps, forwardRef } from 'react'

import { Text, TextProps } from './Text'

type LabelProps = ComponentProps<'label'> & TextProps

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, ...props },
  ref
) {
  return (
    <Text asChild weight="medium" {...props}>
      <label ref={ref}>{children}</label>
    </Text>
  )
})
