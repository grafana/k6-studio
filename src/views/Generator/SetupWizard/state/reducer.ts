import { exhaustive } from '@/utils/typescript'

import {
  STEP_ORDER,
  StepId,
  StepState,
  WizardAction,
  WizardState,
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
 * A completed step can always be revisited; otherwise a step is reachable
 * when every step before it is completed (i.e. it is the next step in line).
 */
export function isStepReachable(state: WizardState, stepId: StepId): boolean {
  if (state.steps[stepId].status === 'completed') {
    return true
  }

  const index = STEP_ORDER.indexOf(stepId)
  const completedPrefixLength = STEP_ORDER.findIndex(
    (step) => state.steps[step].status !== 'completed'
  )

  if (completedPrefixLength === -1) {
    return true
  }

  return index <= completedPrefixLength
}

function withStepState(
  state: WizardState,
  stepId: StepId,
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

    case 'stepRunFailed':
      return withStepState(state, action.stepId, {
        status: 'error',
        message: action.message,
      })

    case 'stepRunAborted':
      return withStepState(state, action.stepId, { status: 'aborted' })

    case 'stepRunReset':
      return withStepState(state, action.stepId, { status: 'not-started' })

    case 'back': {
      const index = STEP_ORDER.indexOf(state.activeStep)

      if (index === 0) {
        return { ...state, screen: 'choice' }
      }

      return { ...state, activeStep: STEP_ORDER[index - 1] ?? state.activeStep }
    }

    case 'continue': {
      if (state.steps[state.activeStep].status !== 'completed') {
        return state
      }

      const next = STEP_ORDER[STEP_ORDER.indexOf(state.activeStep) + 1]

      if (next === undefined) {
        return state
      }

      return { ...state, activeStep: next }
    }

    default:
      return exhaustive(action)
  }
}
