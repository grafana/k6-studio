import { useNavigate } from 'react-router-dom'

import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { useGeneratorParams } from '../../Generator.hooks'
import { getRoutePath } from '@/routeMap'
import { css } from '@emotion/react'

interface TestRuleActionsProps {
  ruleId: string
}

export function TestRuleActions({ ruleId }: TestRuleActionsProps) {
  const { fileName } = useGeneratorParams()
  const navigate = useNavigate()
  const { cloneRule, deleteRule } = useGeneratorStore()

  const handleEdit = () => {
    navigate(
      getRoutePath('rule', { fileName: encodeURIComponent(fileName), ruleId })
    )
  }

  const handleDelete = () => {
    deleteRule(ruleId)
    navigate(
      getRoutePath('generator', { fileName: encodeURIComponent(fileName) })
    )
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
