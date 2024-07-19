import type { GeneratorState } from './types'

export function selectSelectedRule(state: GeneratorState) {
  if (!state.selectedRuleId) {
    return
  }

  const rule = state.rules.find((rule) => rule.id === state.selectedRuleId)

  if (!rule) {
    // TODO: make sure this is handled
    console.error('Rule not found')
  }

  return rule
}

export function selectHasRecording(state: GeneratorState) {
  return state.requests.length > 0
}

export function selectFilteredRequests(state: GeneratorState) {
  return state.requests.filter((request) => {
    return state.allowList.includes(request.request.host)
  })
}
