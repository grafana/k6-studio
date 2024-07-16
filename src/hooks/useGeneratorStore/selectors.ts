import { useGeneratorStore } from './useGeneratorStore'

export function useSelectedRule() {
  return useGeneratorStore((state) => {
    if (!state.selectedRuleId) {
      return
    }

    const rule = state.rules.find((rule) => rule.id === state.selectedRuleId)

    if (!rule) {
      // TODO: make sure this is handled
      console.error('Rule not found')
    }

    return rule
  })
}

export function useHasRecording() {
  return useGeneratorStore((state) => state.requests.length > 0)
}
