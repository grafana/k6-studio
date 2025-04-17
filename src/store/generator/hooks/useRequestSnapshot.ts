import { selectFilteredRequests } from '../selectors'
import { useGeneratorStore } from '../useGeneratorStore'

import { useApplyRules } from './useApplyRules'

export function useRequestSnapshot(id?: string) {
  const { selectedRuleInstance } = useApplyRules()
  const requests = useGeneratorStore(selectFilteredRequests)

  // TODO: remove condition of possible
  if (!id) {
    return
  }

  // Try to find sanpshot of the request before selected rule was applied
  if (
    selectedRuleInstance &&
    'requestSnapshots' in selectedRuleInstance.state
  ) {
    return selectedRuleInstance?.state.requestSnapshots.find(
      (request) => request.id === id
    )?.original
  }

  // Fallback to unmodified requests
  return requests.find((request) => request.id === id)?.request
}
