import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, Tooltip } from '@radix-ui/themes'
import { ComponentProps } from 'react'

import { selectHasVerificationRule, useGeneratorStore } from '@/store/generator'
import { TestRule } from '@/types/rules'
import { createEmptyRule } from '@/utils/rules'

export function NewRuleMenu(props: ComponentProps<typeof Button>) {
  const addRule = useGeneratorStore((store) => store.addRule)
  const hasVerificationRule = useGeneratorStore(selectHasVerificationRule)

  const createRule = (type: TestRule['type']) => {
    if (hasVerificationRule && type === 'verification') {
      return
    }

    const newRule = createEmptyRule(type)
    addRule(newRule)
  }
  const verificationRuleTooltip = hasVerificationRule
    ? 'Currently, you can have only one verification rule.'
    : 'Verify reponse statuses match the recording.'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1" color="gray" mr="2" {...props}>
          <PlusCircledIcon />
          Add rule
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <Tooltip content="Extract and reuse dynamic data." side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('correlation')
            }}
          >
            Correlation
          </DropdownMenu.Item>
        </Tooltip>
        <Tooltip content="Insert custom code snippet." side="right">
          <DropdownMenu.Item
            onClick={() => {
              createRule('customCode')
            }}
          >
            Custom code
          </DropdownMenu.Item>
        </Tooltip>

        <Tooltip content={verificationRuleTooltip} side="right">
          <DropdownMenu.Item
            disabled={hasVerificationRule}
            onClick={() => {
              createRule('verification')
            }}
          >
            Verification (limited)
          </DropdownMenu.Item>
        </Tooltip>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
