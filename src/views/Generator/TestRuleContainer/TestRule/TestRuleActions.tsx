import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { css } from '@emotion/react'

import { useGeneratorStore } from '@/store/generator'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const cloneRule = useGeneratorStore((state) => state.cloneRule)
  const deleteRule = useGeneratorStore((state) => state.deleteRule)
  const setSelectedRuleId = useGeneratorStore(
    (state) => state.setSelectedRuleId
  )

  const handleEdit = () => {
    setSelectedRuleId(ruleId)
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
          variant="ghost"
          color="gray"
          aria-label="Test rule actions"
          css={css`
            margin-left: auto;
          `}
        >
          <DotsVerticalIcon width="15" height="15" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleEdit}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleCopy}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={handleDelete}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
