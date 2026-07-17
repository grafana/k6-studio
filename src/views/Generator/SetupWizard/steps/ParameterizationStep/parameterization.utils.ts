import { z } from 'zod'

import { getJsonObjectFromPath } from '@/rules/selectors/json'
import { isJsonReqResp, matchFilter } from '@/rules/utils'
import { ProxyData } from '@/types'
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

/**
 * Rules apply JSON selectors with lodash get/set, which expects object paths
 * like "user.email". Models often produce JSONPath ("$.user.email") instead,
 * which lodash treats as a literal "$" key and never matches.
 */
function normalizeSelector(
  selector: AiParameter['selector']
): AiParameter['selector'] {
  if (selector.type !== 'json') {
    return selector
  }

  return { ...selector, path: selector.path.replace(/^\$\.?/, '') }
}

/**
 * The script builder writes replaced values back as JSON strings, so a rule
 * targeting a recorded number or boolean would change the body's types and
 * break the request. Returns a model-facing error for such proposals, or null
 * when the target is a string (or cannot be found to prove otherwise).
 */
export function getNonStringTargetError(
  parameter: AiParameter,
  requests: ProxyData[]
): string | null {
  const selector = normalizeSelector(parameter.selector)

  if (selector.type !== 'json') {
    return null
  }

  const nonStringTarget = requests
    .map(({ request }): unknown => {
      const isCandidate =
        matchFilter(request, { path: parameter.location.path }) &&
        isJsonReqResp(request)

      return isCandidate
        ? getJsonObjectFromPath(request.content ?? '', selector.path)
        : undefined
    })
    .find((value) => value !== undefined && typeof value !== 'string')

  if (nonStringTarget === undefined) {
    return null
  }

  return `The recorded value at "${selector.path}" is of type ${typeof nonStringTarget}. Parameterization only supports string values; skip this field.`
}

export function aiParameterToRule(
  parameter: AiParameter
): ParameterizationProposal {
  const rule: ParameterizationRule = {
    id: `parameterization_rule_${crypto.randomUUID()}`,
    type: 'parameterization',
    enabled: true,
    filter: { path: parameter.location.path },
    selector: normalizeSelector(parameter.selector),
    value: { type: 'variable', variableName: parameter.variableName },
  }

  return {
    rule,
    variable: { name: parameter.variableName, value: parameter.recordedValue },
    meta: {
      ruleId: rule.id,
      field: parameter.field,
      location: parameter.location,
      recordedValue: parameter.recordedValue,
    },
  }
}

export interface MergeVariablesResult {
  variables: Variable[]
  /**
   * Names of variables this merge actually created. Excludes proposals that
   * collided with a pre-existing variable, so cleanup on re-run only deletes
   * what this run introduced and never a user's pre-existing variable.
   */
  addedNames: string[]
}

/**
 * Variables are unique by name; later proposals for an existing name reuse
 * the variable instead of duplicating it.
 */
export function mergeVariables(
  existing: Variable[],
  proposed: Variable[]
): MergeVariablesResult {
  const knownNames = new Set(existing.map((variable) => variable.name))
  const additions = proposed.filter((variable) => {
    if (knownNames.has(variable.name)) {
      return false
    }

    knownNames.add(variable.name)
    return true
  })

  return {
    variables: [...existing, ...additions],
    addedNames: additions.map((variable) => variable.name),
  }
}
