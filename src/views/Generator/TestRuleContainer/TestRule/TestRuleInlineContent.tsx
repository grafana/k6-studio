import { CorrelationRule, CustomCodeRule, TestRule } from '@/types/rules'
import { TestRuleFilter } from './TestRuleFilter'
import { Badge, Code } from '@radix-ui/themes'
import { exhaustive } from '@/utils/typescript'
import { TestRuleSelector } from './TestRuleSelector'

interface TestRuleInlineContentProps {
  rule: TestRule
}

export function TestRuleInlineContent({ rule }: TestRuleInlineContentProps) {
  switch (rule.type) {
    case 'correlation':
      return <CorrelationContent rule={rule} />
    case 'customCode':
      return <CustomCodeContent rule={rule} />
    case 'parameterization':
    case 'verification':
      return null
    default:
      return exhaustive(rule)
  }
}

function CorrelationContent({ rule }: { rule: CorrelationRule }) {
  return (
    <>
      <TestRuleFilter filter={rule.extractor.filter} />
      <TestRuleSelector selector={rule.extractor.selector} />
    </>
  )
}

function CustomCodeContent({ rule }: { rule: CustomCodeRule }) {
  return (
    <>
      <Badge>{rule.placement}</Badge> <TestRuleFilter filter={rule.filter} />{' '}
      <Code>{rule.snippet}</Code>
    </>
  )
}
