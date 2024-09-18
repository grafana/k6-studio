import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu } from '@radix-ui/themes'
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
        <Button
          aria-label="Add rule"
          variant="ghost"
          size="1"
          color="gray"
          mr="2"
        >
          <PlusCircledIcon />
          Add rule
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
            createRule('customCode')
          }}
        >
          Custom code rule
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
