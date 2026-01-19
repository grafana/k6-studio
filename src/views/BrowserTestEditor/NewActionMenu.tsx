import { Button, DropdownMenu } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { BrowserActionWithId } from './types'

interface NewActionMenuProps {
  onAddAction: (action: BrowserActionWithId) => void
}

export function NewActionMenu({ onAddAction }: NewActionMenuProps) {
  const handleAddAction = () => {
    onAddAction({
      action: {
        method: 'page.goto',
        url: 'https://example.com',
      },
      id: crypto.randomUUID(),
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1" color="gray">
          <CirclePlusIcon /> Add action
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            handleAddAction()
          }}
        >
          Page navigation
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
