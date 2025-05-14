import * as Slot from '@radix-ui/react-slot'
import { ReactNode } from 'react'

export interface TextProps {
  asChild?: boolean
  size?: '1' | '2'
  weight?: 'light' | 'normal' | 'medium' | 'bold'
  children?: ReactNode
}

export function Text({
  asChild = false,
  size = '2',
  weight = 'normal',
  ...props
}: TextProps) {
  const Component = asChild ? Slot.Root : 'span'

  return <Component {...props} data-size={size} data-weight={weight} />
}
