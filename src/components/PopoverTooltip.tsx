import { Text, Popover } from '@radix-ui/themes'

export function PopoverTooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content
        side="top"
        size="1"
        css={{ lineHeight: 'var(--line-height-1)' }}
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
