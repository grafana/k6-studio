import { ScrollArea, ScrollAreaProps } from '@radix-ui/themes'
import { ReactNode, UIEvent, useRef } from 'react'

import { useAutoScroll } from '@/hooks/useAutoScroll'

interface LogAreaProps extends Omit<ScrollAreaProps, 'onScroll'> {
  tail?: boolean
  items?: number
  children?: ReactNode
  onScrollBack?: () => void
}

export function LogArea({
  tail = false,
  items,
  children,
  onScrollBack,
  ...props
}: LogAreaProps) {
  const ref = useAutoScroll(items, tail)
  const scrollTop = useRef<number>(0)

  const handleMount = (el: HTMLDivElement | null) => {
    ref.current = el

    if (el === null) {
      return
    }

    scrollTop.current = el.scrollTop
  }

  const handleScroll = ({ currentTarget: target }: UIEvent<HTMLDivElement>) => {
    if (!tail) {
      return
    }

    // If the current scroll position is less than the previous one, the user scrolled up.
    if (target.scrollTop < scrollTop.current) {
      const isAtBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 10

      if (!isAtBottom) {
        onScrollBack?.()
      }
    }

    scrollTop.current = target.scrollTop
  }

  return (
    <ScrollArea {...props} onScroll={handleScroll}>
      <div ref={handleMount}>{children}</div>
    </ScrollArea>
  )
}
