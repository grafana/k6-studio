import { Button, DropdownMenu } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { AnyBrowserAction } from '@/main/runner/schema'

interface NewActionMenuProps {
  onAddAction: (action: AnyBrowserAction) => void
}

export function NewActionMenu({ onAddAction }: NewActionMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          <CirclePlusIcon /> Add action
        </Button>
      </DropdownMenu.Trigger>
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
