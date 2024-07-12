import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const { cloneRule, deleteRule, selectRule } = useGeneratorStore()

  const handleEdit = () => {
    selectRule(ruleId)
  }

  const handleDelete = () => {
    deleteRule(ruleId)
  }

  const handleCopy = () => {
    cloneRule(ruleId)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="soft"
          style={{
            marginLeft: 'auto',
          }}
          aria-label="Configure test rule"
        >
          <DotsVerticalIcon width="15" height="15" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleEdit}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleCopy}>Clone</DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={handleDelete}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
