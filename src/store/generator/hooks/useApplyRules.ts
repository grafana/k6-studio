import { useMemo } from 'react'

import { applyRules } from '@/rules/rules'

import { selectFilteredRequests } from '../selectors'
import { useGeneratorStore } from '../useGeneratorStore'

export function useApplyRules() {
  const rules = useGeneratorStore((state) => state.rules)
  const selectedRuleId = useGeneratorStore((state) => state.selectedRuleId)
  const requests = useGeneratorStore(selectFilteredRequests)

  const ruleApplicationResult = useMemo(() => {
    const selectedRuleIndex = selectedRuleId
      ? rules.findIndex((rule) => rule.id === selectedRuleId)
      : -1

    // Apply selected and preceeding rules
    const rulesToApply =
      selectedRuleIndex === -1 ? rules : rules.slice(0, selectedRuleIndex + 1)

    return applyRules(requests, rulesToApply)
  }, [requests, rules, selectedRuleId])

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
