import { PlusIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

import { useGeneratorStore } from '@/store/generator'
import { TestRule } from '@/types/rules'
import { createEmptyRule } from '@/utils/rules'
import { useGeneratorParams } from './Generator.hooks'
import { getRoutePath } from '@/routeMap'

export function NewRuleMenu() {
  const navigate = useNavigate()
  const { fileName } = useGeneratorParams()
  const addRule = useGeneratorStore((store) => store.addRule)

  const createRule = (type: TestRule['type']) => {
    const newRule = createEmptyRule(type)
    addRule(newRule)
    navigate(
      getRoutePath('rule', {
        fileName: encodeURIComponent(fileName),
        ruleId: newRule.id,
      })
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton aria-label="Add rule" variant="soft" radius="full" size="1">
          <PlusIcon />
        </IconButton>
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
            createRule('customCode')
          }}
        >
          Custom code rule
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
