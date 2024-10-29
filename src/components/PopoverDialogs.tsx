import { Popover } from '@radix-ui/themes'

type PopoverDialogProps = Popover.RootProps & {
  children: React.ReactNode
  trigger?: React.ReactNode
}
export function PopoverDialog({
  children,
  trigger,
  ...rest
}: PopoverDialogProps) {
  return (
    <Popover.Root {...rest}>
      {trigger && <Popover.Trigger>{trigger}</Popover.Trigger>}
      <Popover.Content
        width="400px"
        size="1"
        side="bottom"
        align="end"
        avoidCollisions
      >
        {children}
      </Popover.Content>
    </Popover.Root>
  )
}
