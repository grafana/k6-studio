import {
  BorderLeftIcon,
  BorderRightIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons'
import { Badge, Flex, Tooltip } from '@radix-ui/themes'

import {
  CorrelationRule,
  CustomCodeRule,
  TestRule,
  ParameterizationRule,
} from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { TestRuleFilter } from './TestRuleFilter'
import { TestRuleSelector } from './TestRuleSelector'
import { VerificationContent } from './VerificationContent'

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
      return <ParameterizationContent rule={rule} />
    case 'verification':
      return <VerificationContent rule={rule} />
    default:
      return exhaustive(rule)
  }
}

function CorrelationContent({ rule }: { rule: CorrelationRule }) {
  return (
    <>
      {/* <Flex gap="2" align="center"> */}
      <TestRuleFilter filter={rule.extractor.filter} />
      <TestRuleSelector rule={rule} />
      {/* </Flex> */}
    </>
  )
}

function ParameterizationContent({ rule }: { rule: ParameterizationRule }) {
  return (
    <>
      <Flex gap="2" align="center">
        <TestRuleFilter filter={rule.filter} />
        <TestRuleSelector rule={rule} />
      </Flex>
    </>
  )
}

function CustomCodeContent({ rule }: { rule: CustomCodeRule }) {
  return (
    <>
      <Flex gap="2" align="center">
        <TestRuleFilter filter={rule.filter} />
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
            <EyeOpenIcon />
            Snippet
          </Badge>
        </Tooltip>
      </Flex>
    </>
  )
}
