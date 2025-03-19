import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, Tooltip } from '@radix-ui/themes'
import { ComponentProps } from 'react'

import { useGeneratorStore } from '@/store/generator'
import { TestRule } from '@/types/rules'
import { createEmptyRule } from '@/utils/rules'

export function NewRuleMenu(props: ComponentProps<typeof Button>) {
  const addRule = useGeneratorStore((store) => store.addRule)

  const createRule = (type: TestRule['type']) => {
    const newRule = createEmptyRule(type)
    addRule(newRule)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1" color="gray" {...props}>
          <PlusCircledIcon />
          Add rule
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <Tooltip content="Extract and reuse dynamic data" side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('correlation')
            }}
          >
            Correlation
          </DropdownMenu.Item>
        </Tooltip>
        <Tooltip content="Parameterize request data" side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('parameterization')
            }}
          >
            Parameterization
          </DropdownMenu.Item>
        </Tooltip>
        <Tooltip content="Insert custom code snippet" side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('customCode')
            }}
          >
            Custom code
          </DropdownMenu.Item>
        </Tooltip>

        <Tooltip content={'Add status and body checks'} side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('verification')
            }}
          >
            Verification
          </DropdownMenu.Item>
        </Tooltip>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
