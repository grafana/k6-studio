import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu } from '@radix-ui/themes'
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
        <Button variant="ghost" size="1" color="orange" mr="2" {...props}>
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
