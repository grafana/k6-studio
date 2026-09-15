import { useGeneratorStore } from '@/store/generator'

import {
  isStepDone,
  StepState,
  WizardAction,
  WizardState,
  WIZARD_STEPS,
  WizardStep,
} from '../state/types'

/**
 * Removes whatever a completed step committed to the generator store (rules,
 * variables, thresholds), leaving pre-existing user config untouched. Used
 * when a run is withdrawn: re-running a step, or invalidating downstream
 * steps after the host selection changes.
 */
export function withdrawStepArtifacts(stepState: StepState) {
  // Skipped runs commit artifacts too (e.g. the hosts fallback allowlist),
  // so they withdraw the same way completed runs do.
  if (!isStepDone(stepState)) {
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
      // Everything beyond the pre-existing snapshot belongs to the step:
      // the committed suggestions and any rows the user added while on it.
      const preexistingIds = new Set(result.preexistingIds)
      store.setThresholds(
        store.thresholds.filter((threshold) => preexistingIds.has(threshold.id))
      )
      return
    }
  }
}

/**
 * Withdraws every completed step after `stepId` and resets them to
 * not-started. Called whenever that step's committed output changes (host
 * selection edited, re-run, or skipped), because the later analyses were
 * computed against the previous filtered request set. A no-op when nothing
 * downstream has run yet.
 */
export function invalidateDownstreamSteps(
  stepId: WizardStep,
  state: WizardState,
  dispatch: (action: WizardAction) => void
) {
  const laterSteps = WIZARD_STEPS.slice(WIZARD_STEPS.indexOf(stepId) + 1)

  if (laterSteps.every((step) => state.steps[step].status === 'not-started')) {
    return
  }

  laterSteps.forEach((step) => withdrawStepArtifacts(state.steps[step]))
  dispatch({ type: 'invalidateStepsAfter', stepId })
}
