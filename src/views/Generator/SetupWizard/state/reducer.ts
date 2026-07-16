import { exhaustive } from '@/utils/typescript'

import {
  WIZARD_STEPS,
  WizardStep,
  StepState,
  WizardAction,
  WizardState,
  isStepDone,
} from './types'

const notStarted: StepState = { status: 'not-started' }

export const initialWizardState: WizardState = {
  screen: 'choice',
  activeStep: 'hosts',
  steps: {
    hosts: notStarted,
    autocorrelation: notStarted,
    parameterization: notStarted,
    thresholds: notStarted,
    runTest: notStarted,
  },
}

/**
 * A done (completed or skipped) step can always be revisited; otherwise a
 * step is reachable when every step before it is done (i.e. it is the next
 * step in line).
 */
export function isStepReachable(
  state: WizardState,
  stepId: WizardStep
): boolean {
  if (isStepDone(state.steps[stepId])) {
    return true
  }

  const index = WIZARD_STEPS.indexOf(stepId)
  const donePrefixLength = WIZARD_STEPS.findIndex(
    (step) => !isStepDone(state.steps[step])
  )

  if (donePrefixLength === -1) {
    return true
  }

  return index <= donePrefixLength
}

function withStepState(
  state: WizardState,
  stepId: WizardStep,
  stepState: StepState
): WizardState {
  return { ...state, steps: { ...state.steps, [stepId]: stepState } }
}

export function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case 'startWizard':
      return { ...state, screen: 'wizard', activeStep: 'hosts' }

    case 'goToStep': {
      if (!isStepReachable(state, action.stepId)) {
        return state
      }

      return { ...state, activeStep: action.stepId }
    }

    case 'stepRunStarted':
      return withStepState(state, action.stepId, { status: 'running' })

    case 'stepRunCompleted':
      return withStepState(state, action.stepId, {
        status: 'completed',
        result: action.result,
        log: action.log,
        summary: action.summary,
      })

    case 'stepRunSkipped':
      return withStepState(state, action.stepId, {
        status: 'skipped',
        result: action.result,
        log: action.log,
        summary: action.summary,
      })

    case 'stepRunFailed':
      return withStepState(state, action.stepId, {
        status: 'error',
        message: action.message,
      })

    case 'stepRunAborted':
      return withStepState(state, action.stepId, { status: 'aborted' })

    case 'stepRunReset':
      return withStepState(state, action.stepId, { status: 'not-started' })

    // The steps after the given one consumed its output (e.g. the filtered
    // request set); when that output changes their runs no longer apply.
    case 'invalidateStepsAfter': {
      const laterSteps = WIZARD_STEPS.slice(
        WIZARD_STEPS.indexOf(action.stepId) + 1
      )

      return laterSteps.reduce(
        (next, stepId) =>
          withStepState(next, stepId, { status: 'not-started' }),
        state
      )
    }

    case 'back': {
      const index = WIZARD_STEPS.indexOf(state.activeStep)

      if (index === 0) {
        return { ...state, screen: 'choice' }
      }

      return {
        ...state,
        activeStep: WIZARD_STEPS[index - 1] ?? state.activeStep,
      }
    }

    case 'continue': {
      const index = WIZARD_STEPS.indexOf(state.activeStep)

      // Advance only when the active step and everything before it are done,
      // so resetting an earlier step blocks finishing the wizard through
      // still-done later steps.
      const reachedInOrder = WIZARD_STEPS.slice(0, index + 1).every((step) =>
        isStepDone(state.steps[step])
      )

      if (!reachedInOrder) {
        return state
      }

      const next = WIZARD_STEPS[index + 1]

      if (next === undefined) {
        return state
      }

      return { ...state, activeStep: next }
    }

    default:
      return exhaustive(action)
  }
}
