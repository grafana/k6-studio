import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { Tooltip, Text, TextProps } from '@radix-ui/themes'
import { useRef } from 'react'

export function TextWithTooltip({ children, ...props }: TextProps) {
  const ref = useRef<HTMLElement>(null)
  const isEllipsisActive = useOverflowCheck(ref)

  return (
    <Tooltip content={children} hidden={!isEllipsisActive} avoidCollisions>
      <Text {...props} truncate ref={ref}>
        {children}
      </Text>
    </Tooltip>
  )
}
