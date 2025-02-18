import { HTMLProps } from 'react'

interface ScrollViewProps extends HTMLProps<HTMLDivElement> {
  scrollbars?: 'vertical' | 'horizontal' | 'both'
}

export function ScrollView({ scrollbars = 'both', ...props }: ScrollViewProps) {
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
