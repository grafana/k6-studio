import { CorrelationRule, CustomCodeRule, TestRule } from '@/schemas/rules'
import { TestRuleFilter } from './TestRuleFilter'
import { Badge, Tooltip } from '@radix-ui/themes'
import { exhaustive } from '@/utils/typescript'
import { TestRuleSelector } from './TestRuleSelector'
import { EyeOpenIcon } from '@radix-ui/react-icons'

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
      <Badge color="gray">{rule.placement}</Badge>{' '}
      <TestRuleFilter filter={rule.filter} />{' '}
      <Badge color="gray">
        Snippet
        <Tooltip content={<code>{rule.snippet}</code>}>
          <EyeOpenIcon width={15} height={15} />
        </Tooltip>
      </Badge>
    </>
  )
}
