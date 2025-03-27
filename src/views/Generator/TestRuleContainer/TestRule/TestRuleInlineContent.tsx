import { TestRule, Filter } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { TestRuleFilter } from './TestRuleFilter'
import { TestRuleSelector } from './TestRuleSelector'

interface TestRuleInlineContentProps {
  rule: TestRule
}

export function TestRuleInlineContent({ rule }: TestRuleInlineContentProps) {
  switch (rule.type) {
    case 'correlation':
      return <RulePreview rule={rule} filter={rule.extractor.filter} />
    case 'customCode':
    case 'parameterization':
    case 'verification':
      return <RulePreview rule={rule} filter={rule.filter} />
    default:
      return exhaustive(rule)
  }
}

function RulePreview({ rule, filter }: { rule: TestRule; filter: Filter }) {
  return (
    <>
      <TestRuleFilter filter={filter} />
      <TestRuleSelector rule={rule} />
    </>
  )
}
