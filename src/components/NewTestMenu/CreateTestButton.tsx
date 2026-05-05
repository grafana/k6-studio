import { Button, DropdownMenu } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { useCreateTestActions } from '@/hooks/useCreateTestActions'

export function CreateTestButton() {
  const {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
    isBrowserEditorEnabled,
  } = useCreateTestActions()

  if (!isBrowserEditorEnabled) {
    return (
      <Button variant="soft" onClick={() => handleCreateHTTPTest()}>
        <CirclePlusIcon /> Create test
      </Button>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft">
          <CirclePlusIcon /> Create test
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
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
