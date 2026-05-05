import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'

import { useCreateTestActions } from '@/hooks/useCreateTestActions'

export function NewTestMenu() {
  const {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
    isBrowserEditorEnabled,
  } = useCreateTestActions()

  if (!isBrowserEditorEnabled) {
    return (
      <Tooltip content="New generator" side="right">
        <IconButton
          aria-label="New generator"
          variant="ghost"
          size="1"
          onClick={() => handleCreateHTTPTest()}
        >
          <PlusIcon />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <DropdownMenu.Root>
      <Tooltip content="New test" side="right">
        <DropdownMenu.Trigger>
          <IconButton aria-label="New test" variant="ghost" size="1">
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
