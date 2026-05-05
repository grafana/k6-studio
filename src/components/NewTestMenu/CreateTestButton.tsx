import { Button, DropdownMenu } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useFeaturesStore } from '@/store/features'

export function CreateTestButton() {
  const handleCreateHTTPTest = useCreateGenerator()
  const handleCreateBrowserTest = useCreateBrowserTest()
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

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
