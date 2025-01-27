import { HTMLProps } from 'react'

interface ScrollerProps {
  scrollbars?: 'vertical' | 'horizontal' | 'both'
}

export function Scroller({
  scrollbars = 'both',
  ...props
}: ScrollerProps & HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        ...props.style,
        ...(scrollbars === 'vertical' && { overflowY: 'auto' }),
        ...(scrollbars === 'horizontal' && { overflowX: 'auto' }),
        ...(scrollbars === 'both' && { overflow: 'auto' }),
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--gray-a8) var(--gray-a3)',
      }}
    />
  )
}
