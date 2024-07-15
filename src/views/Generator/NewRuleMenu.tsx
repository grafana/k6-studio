import { PlusIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu } from '@radix-ui/themes'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'

export function NewRuleMenu() {
  const { createRule } = useGeneratorStore()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="solid">
          Add rule
          <PlusIcon width="15" height="15" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            createRule('correlation')
          }}
        >
          Correlation rule
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            createRule('verification')
          }}
          disabled
        >
          Verification rule
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            createRule('parameterization')
          }}
          disabled
        >
          Parameterization rule
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            createRule('customCode')
          }}
          disabled
        >
          Custom code rule
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
