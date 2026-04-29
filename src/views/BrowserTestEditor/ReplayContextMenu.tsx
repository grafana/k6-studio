import { DropdownMenu } from '@radix-ui/themes'

import { ContextMenuEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'

interface ReplayContextMenuProps {
  position: ContextMenuEvent
  onClose: () => void
}

export function ReplayContextMenu({
  position,
  onClose,
}: ReplayContextMenuProps) {
  return (
    <DropdownMenu.Root open onOpenChange={(open) => !open && onClose()}>
      <DropdownMenu.Trigger>
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1">
        <DropdownMenu.Item>Add click action</DropdownMenu.Item>
        <DropdownMenu.Item>Add assertion</DropdownMenu.Item>
        <DropdownMenu.Item>Inspect element</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
