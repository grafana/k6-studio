import { CorrelationRule, CustomCodeRule, TestRule } from '@/types/rules'
import { TestRuleFilter } from './TestRuleFilter'
import { Badge, Tooltip } from '@radix-ui/themes'
import { exhaustive } from '@/utils/typescript'
import { TestRuleSelector } from './TestRuleSelector'
import {
  BorderLeftIcon,
  BorderRightIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons'

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
      <TestRuleFilter filter={rule.filter} />{' '}
      <Tooltip
        content={`${rule.placement === 'after' ? 'After' : 'Before'} matched requests`}
      >
        <Badge color="gray">
          {rule.placement === 'after' ? (
            <BorderRightIcon />
          ) : (
            <BorderLeftIcon />
          )}
          {rule.placement}
        </Badge>
      </Tooltip>
      <Badge color="gray">
        Snippet
        <Tooltip content={<code>{rule.snippet}</code>}>
          <EyeOpenIcon width={15} height={15} />
        </Tooltip>
      </Badge>
    </>
  )
}
