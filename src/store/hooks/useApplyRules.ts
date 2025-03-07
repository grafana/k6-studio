import { applyRules } from '@/rules/rules'
import { selectFilteredRequests, useGeneratorStore } from '../generator'
import { useMemo } from 'react'

export function useApplyRules() {
  const rules = useGeneratorStore((state) => state.rules)
  const selectedRuleId = useGeneratorStore((state) => state.selectedRuleId)
  const requests = useGeneratorStore(selectFilteredRequests)

  const ruleApplicationResult = useMemo(
    () => applyRules(requests, rules),
    [requests, rules]
  )

  const selectedRuleInstance = useMemo(
    () =>
      ruleApplicationResult.ruleInstances.find(
        (ruleInstance) => ruleInstance.rule.id === selectedRuleId
      ),
    [ruleApplicationResult.ruleInstances, selectedRuleId]
  )

  const requestsWithRulesApplied = useMemo(
    () =>
      ruleApplicationResult.requestSnippetSchemas.map(
        (snippet) => snippet.data
      ),
    [ruleApplicationResult.requestSnippetSchemas]
  )

  return {
    selectedRuleInstance,
    requestsWithRulesApplied,
  }
}
