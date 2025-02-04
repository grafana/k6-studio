import { Popover } from '@radix-ui/themes'

type PopoverDialogProps = Popover.RootProps & {
  children: React.ReactNode
  trigger?: React.ReactNode
  width?: string
  align?: 'start' | 'end' | 'center'
}
export function PopoverDialog({
  children,
  trigger,
  width = '400px',
  align = 'end',
  ...rest
}: PopoverDialogProps) {
  return (
    <Popover.Root {...rest}>
      {trigger && <Popover.Trigger>{trigger}</Popover.Trigger>}
      <Popover.Content
        width={width}
        maxWidth={width}
        size="1"
        side="bottom"
        align={align}
        avoidCollisions
      >
        {children}
      </Popover.Content>
    </Popover.Root>
  )
}
