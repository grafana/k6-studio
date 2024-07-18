import { Badge } from '@radix-ui/themes'

import { TestRule } from '@/schemas/rules'
import { exhaustive } from '@/utils/typescript'

interface TestRuleTypeBadgeProps {
  rule: TestRule
}

export function TestRuleTypeBadge({ rule }: TestRuleTypeBadgeProps) {
  const label = getLabel(rule)
  const color = getColor(rule)

  return (
    <Badge color={color} variant="solid">
      {label}
    </Badge>
  )
}

function getLabel(rule: TestRule) {
  switch (rule.type) {
    case 'customCode':
      return 'Custom code'
    case 'correlation':
      return 'Correlation'
    case 'parameterization':
      return 'Parameterization'
    case 'verification':
      return 'Verification'
    default:
      return exhaustive(rule)
  }
}

function getColor(rule: TestRule) {
  switch (rule.type) {
    case 'customCode':
      return 'amber'
    case 'correlation':
      return 'blue'
    case 'parameterization':
      return 'green'
    case 'verification':
      return 'yellow'
    default:
      return exhaustive(rule)
  }
}
