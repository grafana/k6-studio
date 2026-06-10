import { z } from 'zod'

import { ParameterizationRule } from '@/types/rules'
import { Variable } from '@/types/testData'

import { ParamSuggestionMeta } from '../../state/types'

import { parameterSchema } from './constants'

export type AiParameter = z.infer<typeof parameterSchema>

export interface ParameterizationProposal {
  rule: ParameterizationRule
  variable: Variable
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
    value: { type: 'variable', variableName: parameter.variableName },
  }

  return {
    rule,
    variable: { name: parameter.variableName, value: parameter.recordedValue },
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

/**
 * Variables are unique by name; later proposals for an existing name reuse
 * the variable instead of duplicating it.
 */
export function mergeVariables(
  existing: Variable[],
  proposed: Variable[]
): Variable[] {
  const knownNames = new Set(existing.map((variable) => variable.name))
  const additions = proposed.filter((variable) => {
    if (knownNames.has(variable.name)) {
      return false
    }

    knownNames.add(variable.name)
    return true
  })

  return [...existing, ...additions]
}
