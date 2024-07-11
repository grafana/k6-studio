import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { GearIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const { deleteRule } = useGeneratorStore()

  const handleEdit = () => {
    console.log('Edit rule', ruleId)
  }

  const handleDelete = () => {
    deleteRule(ruleId)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          size="1"
          variant="soft"
          style={{
            marginLeft: 'auto',
          }}
          aria-label="Configure test rule"
        >
          <GearIcon width="15" height="15" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1">
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={handleDelete}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
