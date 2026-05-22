import { applyRules } from '@/rules/rules'
import type { ProxyData } from '@/types'
import type { AiCorrelationRule } from '@/types/autoCorrelation'
import type { CorrelationRule, CorrelationState } from '@/types/rules'

export interface AddRuleSuccess {
  ok: true
  rule: CorrelationRule
  correlationState: CorrelationState
  matchedRequestIds: string[]
  variableName: string
}

export interface AddRuleFailure {
  ok: false
  reason: string
}

export type AddRuleResult = AddRuleSuccess | AddRuleFailure

const NO_MATCH_REASON =
  'The provided rule did not match any requests in the recording. Review the rule and try again.'

function toCorrelationRule(rule: AiCorrelationRule): CorrelationRule {
  return {
    ...rule,
    id: `autocorrelation_rule_${crypto.randomUUID()}`,
    type: 'correlation',
    enabled: true,
  }
}

export function computeAddRuleResult(
  aiRule: AiCorrelationRule,
  existingRules: CorrelationRule[],
  recording: ProxyData[]
): AddRuleResult {
  const validRule = toCorrelationRule(aiRule)
  const applyResult = applyRules(recording, [...existingRules, validRule])

  const newRuleInstance = applyResult.ruleInstances.at(-1)
  if (!newRuleInstance || newRuleInstance.type !== 'correlation') {
    return { ok: false, reason: NO_MATCH_REASON }
  }

  const { matchedRequestIds } = newRuleInstance.state
  if (matchedRequestIds.length === 0) {
    return { ok: false, reason: NO_MATCH_REASON }
  }

  const variableName =
    aiRule.extractor.variableName ??
    validRule.extractor.variableName ??
    'rule'

  return {
    ok: true,
    rule: validRule,
    correlationState: newRuleInstance.state,
    matchedRequestIds,
    variableName,
  }
}
