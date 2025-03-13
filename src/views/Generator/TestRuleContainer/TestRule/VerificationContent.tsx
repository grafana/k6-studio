import { VerificationRule } from '@/types/rules'
import { TestRuleFilter } from './TestRuleFilter'
import { Badge, Strong } from '@radix-ui/themes'
import { exhaustive } from '@/utils/typescript'
import { DiscIcon, Link1Icon } from '@radix-ui/react-icons'

export function VerificationContent({ rule }: { rule: VerificationRule }) {
  return (
    <>
      <TestRuleFilter filter={rule.filter} />
      <Badge color="gray">
        Verify <Strong>{rule.target}</Strong>{' '}
        <OperatorLabel operator={rule.operator} /> <ValueLabel rule={rule} />
      </Badge>
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
