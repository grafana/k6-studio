import { Flex } from '@radix-ui/themes'

import type { TestRule } from '@/schemas/rules'
import { TestRuleActions } from './TestRuleActions'
import { TestRuleTypeBadge } from './TestRuleTypeBadge'
import { TestRuleInlineContent } from './TestRuleInlineContent'

interface TestRuleItemProps {
  rule: TestRule
  isSelected: boolean
}

export function TestRuleItem({ rule, isSelected }: TestRuleItemProps) {
  return (
    <Flex
      gap="2"
      align="center"
      p="1"
      style={{
        borderRadius: 'var(--radius-1)',
        border: '1px solid transparent',
        borderColor: isSelected ? 'var(--accent-5)' : 'transparent',
        backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--gray-2)',
      }}
    >
      <TestRuleTypeBadge rule={rule} />
      <TestRuleInlineContent rule={rule} />
      <TestRuleActions ruleId={rule.id} />
    </Flex>
  )
}
