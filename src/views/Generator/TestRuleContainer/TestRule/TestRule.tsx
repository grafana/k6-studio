import { Flex } from '@radix-ui/themes'

import type { TestRule } from '@/types/rules'
import { TestRuleActions } from './TestRuleActions'
import { TestRuleTypeBadge } from './TestRuleTypeBadge'
import { TestRuleInlineContent } from './TestRuleInlineContent'

interface TestRuleItemProps {
  rule: TestRule
}

export function TestRuleItem({ rule }: TestRuleItemProps) {
  return (
    <Flex
      gap="2"
      align="center"
      p="1"
      style={{
        borderRadius: 'var(--radius-1)',
        backgroundColor: 'var(--gray-2)',
      }}
    >
      <TestRuleTypeBadge rule={rule} />
      <TestRuleInlineContent rule={rule} />
      <TestRuleActions ruleId={rule.id} />
    </Flex>
  )
}
