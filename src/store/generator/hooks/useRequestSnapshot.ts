import { selectFilteredRequests } from '../selectors'
import { useGeneratorStore } from '../useGeneratorStore'

import { useApplyRules } from './useApplyRules'

export function useRequestSnapshot(id?: string) {
  const { selectedRuleInstance } = useApplyRules()
  const requests = useGeneratorStore(selectFilteredRequests)

  // TODO: Would be nice to make it non-option here
  if (!id) {
    return
  }

  // Try to find sanpshot of the request before selected rule was applied
  if (
    selectedRuleInstance &&
    'requestsReplaced' in selectedRuleInstance.state
  ) {
    return selectedRuleInstance?.state.requestsReplaced.find(
      (request) => request.id === id
    )?.original
  }

  // Fallback to unmodified requests
  return requests.find((request) => request.id === id)?.request
}
