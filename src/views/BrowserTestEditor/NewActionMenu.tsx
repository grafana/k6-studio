import { DropdownMenu } from '@radix-ui/themes'

import { AnyBrowserAction } from '@/main/runner/schema'

interface NewActionMenuProps {
  onAddAction: (action: AnyBrowserAction) => void
  trigger: React.ReactNode
}

export function NewActionMenu({ onAddAction, trigger }: NewActionMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction({
              method: 'page.goto',
              url: 'https://example.com',
            })
          }}
        >
          Page navigation
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
