import { DropdownMenu } from '@radix-ui/themes'

import { BrowserActionWithId } from './types'

interface NewActionMenuProps {
  onAddAction: (action: BrowserActionWithId) => void
  trigger: React.ReactNode
}

export function NewActionMenu({ onAddAction, trigger }: NewActionMenuProps) {
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
      <DropdownMenu.Trigger>{trigger}</DropdownMenu.Trigger>
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
