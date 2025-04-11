import { useMemo } from 'react'

import { applyRules } from '@/rules/rules'

import { selectFilteredRequests } from '../selectors'
import { useGeneratorStore } from '../useGeneratorStore'

export function useApplyRules() {
  const rules = useGeneratorStore((state) => state.rules)
  const selectedRuleId = useGeneratorStore((state) => state.selectedRuleId)
  const requests = useGeneratorStore(selectFilteredRequests)

  // TODO: refactor
  const ruleApplicationResult = useMemo(() => {
    // const grouped = groupBy(rules, rule => ru)
    const selectedRuleIndex = rules.findIndex(
      (rule) => rule.id === selectedRuleId
    )
    // const preceedingRules = rules.slice(0, selectedRuleIndex + 1)
    const rls =
      selectedRuleIndex === -1 ? rules : rules.slice(0, selectedRuleIndex + 1)

    console.log('rls', rls)
    return applyRules(requests, rls)
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
