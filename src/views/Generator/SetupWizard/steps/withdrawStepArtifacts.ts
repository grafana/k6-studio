import { useGeneratorStore } from '@/store/generator'

import { StepState } from '../state/types'

/**
 * Removes whatever a completed step committed to the generator store (rules,
 * variables, thresholds), leaving pre-existing user config untouched. Used
 * when a run is withdrawn: re-running a step, or invalidating downstream
 * steps after the host selection changes.
 */
export function withdrawStepArtifacts(stepState: StepState) {
  if (stepState.status !== 'completed') {
    return
  }

  const result = stepState.result
  const store = useGeneratorStore.getState()

  switch (result.step) {
    case 'hosts':
      return

    case 'autocorrelation': {
      const committedIds = new Set(result.entries.map((entry) => entry.rule.id))
      store.setRules(store.rules.filter((rule) => !committedIds.has(rule.id)))
      return
    }

    case 'parameterization': {
      const ruleIds = new Set(
        result.suggestions.map((suggestion) => suggestion.ruleId)
      )
      // Only delete variables this run created. A proposal that reused a
      // pre-existing variable name is absent from addedVariableNames, so the
      // user's pre-existing variable survives.
      const removedVariableNames = new Set(result.addedVariableNames)

      store.setRules(store.rules.filter((rule) => !ruleIds.has(rule.id)))
      store.setVariables(
        store.variables.filter(
          (variable) => !removedVariableNames.has(variable.name)
        )
      )
      return
    }

    case 'thresholds': {
      const committedIds = new Set(Object.keys(result.rationaleById))
      store.setThresholds(
        store.thresholds.filter((threshold) => !committedIds.has(threshold.id))
      )
      return
    }
  }
}
