import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

interface TestRuleTypeBadgeProps {
  rule: TestRule
}

export function TestRuleTypeBadge({ rule }: TestRuleTypeBadgeProps) {
  const label = getLabel(rule)

  return (
    <Text
      size="1"
      weight="bold"
      color="gray"
      css={css`
        text-transform: uppercase;
        white-space: nowrap;
      `}
    >
      {label}
    </Text>
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
