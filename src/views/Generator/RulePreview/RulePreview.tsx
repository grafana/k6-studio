import { CorrelationPreview } from './CorrelationPreview'
import { exhaustive } from '@/utils/typescript'
import { selectRuleById, useGeneratorStore } from '@/store/generator'
import { useGeneratorParams } from '../Generator.hooks'

export function RulePreview() {
  const { ruleId } = useGeneratorParams()
  const rule = useGeneratorStore((store) => selectRuleById(store, ruleId))

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return <CorrelationPreview rule={rule} />

    case 'customCode':
    case 'parameterization':
    case 'verification':
    case 'recording-verification':
      return null

    default:
      return exhaustive(rule)
  }
}
