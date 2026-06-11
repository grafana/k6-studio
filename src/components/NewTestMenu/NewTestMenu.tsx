import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'

import { useCreateTestActions } from '@/hooks/useCreateTestActions'

export function NewTestMenu() {
  const { handleCreateHTTPTest, handleCreateBrowserTest } =
    useCreateTestActions()

  return (
    <DropdownMenu.Root>
      <Tooltip content="New test" side="right">
        <DropdownMenu.Trigger>
          <IconButton
            aria-label="New test"
            variant="ghost"
            size="1"
            color="gray"
          >
            <PlusIcon />
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content side="right" align="start" size="1">
        <DropdownMenu.Item onSelect={() => handleCreateHTTPTest()}>
          HTTP test
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => handleCreateBrowserTest()}>
          Browser test
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
