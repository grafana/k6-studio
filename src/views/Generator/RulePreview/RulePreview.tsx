import { CorrelationPreview } from './CorrelationPreview'
import { exhaustive } from '@/utils/typescript'
import { selectSelectedRule, useGeneratorStore } from '@/store/generator'

export function RulePreview() {
  const rule = useGeneratorStore(selectSelectedRule)

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return <CorrelationPreview rule={rule} />

    case 'customCode':
    case 'parameterization':
    case 'verification':
      return <div>Not implemented</div>

    default:
      return exhaustive(rule)
  }
}
