import { CorrelationPreview } from './CorrelationPreview'
import { exhaustive } from '@/utils/typescript'
import { TestRule } from '@/types/rules'

export function RulePreview({ rule }: { rule: TestRule }) {
  switch (rule.type) {
    case 'correlation':
      return <CorrelationPreview rule={rule} />

    case 'customCode':
    case 'parameterization':
    case 'verification':
      return <div>Not implemented</div>

    case undefined:
      return null

    default:
      return exhaustive(rule)
  }
}
