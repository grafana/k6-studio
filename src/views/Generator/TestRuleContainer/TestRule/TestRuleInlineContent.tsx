import {
  CorrelationRule,
  CustomCodeRule,
  TestRule,
  VerificationRule,
} from '@/types/rules'
import { TestRuleFilter } from './TestRuleFilter'
import { Badge, Tooltip } from '@radix-ui/themes'
import { exhaustive } from '@/utils/typescript'
import { TestRuleSelector } from './TestRuleSelector'
import {
  BorderLeftIcon,
  BorderRightIcon,
  EyeOpenIcon,
  DiscIcon,
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
      return null
    case 'verification':
      return <VerificationContent rule={rule} />
    default:
      return exhaustive(rule)
  }
}

function VerificationContent({ rule }: { rule: VerificationRule }) {
  return (
    <>
      <TestRuleFilter filter={rule.filter} />{' '}
      <Tooltip content="Checks that all request statuses match the recording.">
        <Badge color="gray">
          <DiscIcon /> Recording
        </Badge>
      </Tooltip>
    </>
  )
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
      <Tooltip content={<code>{rule.snippet}</code>}>
        <Badge color="gray">
          Snippet
          <EyeOpenIcon width={15} height={15} />
        </Badge>
      </Tooltip>
    </>
  )
}
