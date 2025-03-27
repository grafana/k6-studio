import { DiscIcon, Link1Icon } from '@radix-ui/react-icons'
import { Strong } from '@radix-ui/themes'

import { VerificationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

export function VerificationContent({ rule }: { rule: VerificationRule }) {
  return (
    <>
      Verify <Strong>{rule.target}</Strong>{' '}
      <OperatorLabel operator={rule.operator} /> <ValueLabel rule={rule} />
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
        <Strong>
          <DiscIcon /> recorded value
        </Strong>
      )
    case 'string':
      return <Strong>{rule.value.value}</Strong>
    case 'number':
      return <Strong>{rule.value.number}</Strong>
    case 'variable':
      return (
        <Strong>
          <Link1Icon /> {rule.value.variableName}
        </Strong>
      )
    default:
      return exhaustive(rule.value)
  }
}
