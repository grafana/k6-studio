import { useNavigate } from 'react-router-dom'

import { DotsVerticalIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { useGeneratorParams } from '../../Generator.hooks'
import { getRoutePath } from '@/routeMap'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const { path } = useGeneratorParams()
  const navigate = useNavigate()
  const { cloneRule, deleteRule } = useGeneratorStore()

  const handleEdit = () => {
    navigate(getRoutePath('rule', { path: encodeURIComponent(path), ruleId }))
  }

  const handleDelete = () => {
    deleteRule(ruleId)
    navigate(getRoutePath('generator', { path: encodeURIComponent(path) }))
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
