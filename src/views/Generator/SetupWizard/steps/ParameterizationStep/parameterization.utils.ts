import { z } from 'zod'

import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

import { parameterSchema } from './constants'

export type AiParameter = z.infer<typeof parameterSchema>

export interface ParameterizationProposal {
  rule: ParameterizationRule
  meta: ParamSuggestionMeta
}

export function aiParameterToRule(
  parameter: AiParameter
): ParameterizationProposal {
  const rule: ParameterizationRule = {
    id: `parameterization_rule_${crypto.randomUUID()}`,
    type: 'parameterization',
    enabled: true,
    filter: { path: parameter.location.path },
    selector: parameter.selector,
    value: parameter.value,
  }

  return {
    rule,
    meta: {
      ruleId: rule.id,
      field: parameter.field,
      location: parameter.location,
      confidence: parameter.confidence,
      secret: parameter.secret,
      recordedValue: parameter.recordedValue,
    },
  }
}
