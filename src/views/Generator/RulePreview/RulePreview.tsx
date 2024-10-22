import { CorrelationPreview } from './CorrelationPreview'
import { exhaustive } from '@/utils/typescript'
import { selectSelectedRule, useGeneratorStore } from '@/store/generator'
import { ParameterizationPreview } from './ParameterizationPreview'

export function RulePreview() {
  const rule = useGeneratorStore(selectSelectedRule)

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return <CorrelationPreview rule={rule} />

    case 'parameterization':
      return <ParameterizationPreview rule={rule} />

    case 'customCode':
    case 'verification':
      return null

    default:
      return exhaustive(rule)
  }
}
