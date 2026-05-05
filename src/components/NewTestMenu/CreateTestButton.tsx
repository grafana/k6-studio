import { Button, DropdownMenu } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'

import { useCreateTestActions } from '@/hooks/useCreateTestActions'

export function CreateTestButton() {
  const {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
    isBrowserEditorEnabled,
  } = useCreateTestActions()

  if (!isBrowserEditorEnabled) {
    return (
      <Button size="1" variant="soft" onClick={() => handleCreateHTTPTest()}>
        <PlusIcon /> Create test
      </Button>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button size="1" variant="soft">
          <PlusIcon /> Create test
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1">
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
