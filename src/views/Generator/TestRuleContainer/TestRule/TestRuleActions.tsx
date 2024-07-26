import { DotsVerticalIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'
import { useGeneratorStore } from '@/store/generator'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const navigate = useNavigate()
  const { cloneRule, deleteRule, selectRule } = useGeneratorStore()

  const handleEdit = () => {
    selectRule(ruleId)
    navigate(`/generator/rule/${ruleId}`)
  }

  const handleDelete = () => {
    deleteRule(ruleId)
  }

  const handleCopy = () => {
    cloneRule(ruleId)
  }

  return (
    <Flex
      gap="2"
      style={{
        marginLeft: 'auto',
      }}
    >
      <IconButton
        variant="soft"
        aria-label="Configure test rule"
        onClick={handleEdit}
      >
        <Pencil1Icon width="15" height="15" />
      </IconButton>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="soft" aria-label="Test rule actions">
            <DotsVerticalIcon width="15" height="15" />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={handleCopy}>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item color="red" onClick={handleDelete}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  )
}
