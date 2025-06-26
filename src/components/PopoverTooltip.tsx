import { Text, Popover } from '@radix-ui/themes'
import { useState } from 'react'
import { useDebounce } from 'react-use'

export function PopoverTooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: React.ReactNode
}) {
  const [open, setOpen] = useDebouncedValue(false, 200)

  const handleMouseEnter = () => {
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <Popover.Root open={open}>
      <Popover.Trigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Popover.Trigger>
      <Popover.Content
        side="top"
        size="1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        css={{ lineHeight: 'var(--line-height-1)' }}
        // Prevent stealing focus from the inputs
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {typeof content === 'string' ? (
          <Text size="1">{content}</Text>
        ) : (
          content
        )}
      </Popover.Content>
    </Popover.Root>
  )
}

function useDebouncedValue<T>(initialValue: T, delay: number) {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useDebounce(
    () => {
      setDebouncedValue(value)
    },
    delay,
    [value]
  )

  return [debouncedValue, setValue] as const
}
