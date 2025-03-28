import { DiscIcon, Link1Icon } from '@radix-ui/react-icons'
import { Badge, Strong, Flex } from '@radix-ui/themes'

import { VerificationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { TestRuleFilter } from './TestRuleFilter'

export function VerificationContent({ rule }: { rule: VerificationRule }) {
  return (
    <>
      <Flex gap="2" align="center">
        <TestRuleFilter filter={rule.filter} />
        <Badge color="gray">
          Verify <Strong>{rule.target}</Strong>{' '}
          <OperatorLabel operator={rule.operator} /> <ValueLabel rule={rule} />
        </Badge>
      </Flex>
    </>
  )
}

function OperatorLabel({
  operator,
}: {
  operator: VerificationRule['operator']
}) {
  switch (operator) {
    case 'equals':
    case 'contains':
      return operator
    case 'notContains':
      return 'does not contain'
    case 'notEquals':
      return 'does not equal'
    default:
      return exhaustive(operator)
  }
}

function ValueLabel({ rule }: { rule: VerificationRule }) {
  switch (rule.value.type) {
    case 'recordedValue':
      return (
        <Strong css={{ whiteSpace: 'nowrap' }}>
          <DiscIcon css={{ verticalAlign: 'middle', display: 'inline' }} />{' '}
          recorded value
        </Strong>
      )
    case 'string':
      return <Strong>{rule.value.value}</Strong>
    case 'number':
      return <Strong>{rule.value.number}</Strong>
    case 'variable':
      return (
        <Strong>
          <Link1Icon css={{ verticalAlign: 'middle', display: 'inline' }} />{' '}
          {rule.value.variableName}
        </Strong>
      )
    default:
      return exhaustive(rule.value)
  }
}
