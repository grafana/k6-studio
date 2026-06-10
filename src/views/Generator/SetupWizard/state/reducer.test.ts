import { describe, expect, it } from 'vitest'

import {
  initialWizardState,
  isStepReachable,
  wizardReducer,
} from './reducer'
import { StepId, StepResult, WizardState } from './types'

function completedStep(): WizardState['steps'][StepId] {
  const result: StepResult = { step: 'autocorrelation', ruleIds: [] }

  return { status: 'completed', result, log: [], summary: 'done' }
}

function stateWithCompleted(...steps: StepId[]): WizardState {
  return steps.reduce(
    (state, step) => ({
      ...state,
      steps: { ...state.steps, [step]: completedStep() },
    }),
    { ...initialWizardState, screen: 'wizard' as const }
  )
}

describe('wizardReducer', () => {
  it('starts on the choice screen with all steps not started', () => {
    expect(initialWizardState.screen).toBe('choice')
    expect(initialWizardState.activeStep).toBe('hosts')
    expect(
      Object.values(initialWizardState.steps).every(
        (step) => step.status === 'not-started'
      )
    ).toBe(true)
  })

  it('startWizard switches to the wizard screen on the first step', () => {
    const state = wizardReducer(initialWizardState, { type: 'startWizard' })

    expect(state.screen).toBe('wizard')
    expect(state.activeStep).toBe('hosts')
  })

  it('continue advances to the next step when the active step is completed', () => {
    const state = stateWithCompleted('hosts')

    const next = wizardReducer(state, { type: 'continue' })

    expect(next.activeStep).toBe('autocorrelation')
  })

  it('continue does nothing when the active step is not completed', () => {
    const state: WizardState = { ...initialWizardState, screen: 'wizard' }

    const next = wizardReducer(state, { type: 'continue' })

    expect(next.activeStep).toBe('hosts')
  })

  it('continue does nothing on the last step', () => {
    const state: WizardState = {
      ...stateWithCompleted('hosts', 'autocorrelation', 'parameterization', 'thresholds'),
      activeStep: 'thresholds',
    }

    const next = wizardReducer(state, { type: 'continue' })

    expect(next.activeStep).toBe('thresholds')
  })

  it('back moves to the previous step', () => {
    const state: WizardState = {
      ...stateWithCompleted('hosts'),
      activeStep: 'autocorrelation',
    }

    const next = wizardReducer(state, { type: 'back' })

    expect(next.activeStep).toBe('hosts')
    expect(next.screen).toBe('wizard')
  })

  it('back from the first step returns to the choice screen', () => {
    const state: WizardState = { ...initialWizardState, screen: 'wizard' }

    const next = wizardReducer(state, { type: 'back' })

    expect(next.screen).toBe('choice')
  })

  it('goToStep jumps to a completed step', () => {
    const state: WizardState = {
      ...stateWithCompleted('hosts', 'autocorrelation'),
      activeStep: 'parameterization',
    }

    const next = wizardReducer(state, { type: 'goToStep', stepId: 'hosts' })

    expect(next.activeStep).toBe('hosts')
  })

  it('goToStep allows jumping forward to the step after the completed prefix', () => {
    const state: WizardState = {
      ...stateWithCompleted('hosts', 'autocorrelation'),
      activeStep: 'hosts',
    }

    const next = wizardReducer(state, {
      type: 'goToStep',
      stepId: 'parameterization',
    })

    expect(next.activeStep).toBe('parameterization')
  })

  it('goToStep ignores steps beyond the completed prefix', () => {
    const state = stateWithCompleted('hosts')

    const next = wizardReducer(state, { type: 'goToStep', stepId: 'thresholds' })

    expect(next.activeStep).toBe('hosts')
  })

  it('records a step run lifecycle', () => {
    const running = wizardReducer(
      { ...initialWizardState, screen: 'wizard' },
      { type: 'stepRunStarted', stepId: 'hosts' }
    )
    expect(running.steps.hosts.status).toBe('running')

    const completed = wizardReducer(running, {
      type: 'stepRunCompleted',
      stepId: 'hosts',
      result: { step: 'hosts', suggestions: [] },
      log: [],
      summary: 'Included 3 of 7 hosts',
    })
    expect(completed.steps.hosts).toEqual({
      status: 'completed',
      result: { step: 'hosts', suggestions: [] },
      log: [],
      summary: 'Included 3 of 7 hosts',
    })
  })

  it('records failures and aborts', () => {
    const failed = wizardReducer(
      { ...initialWizardState, screen: 'wizard' },
      { type: 'stepRunFailed', stepId: 'hosts', message: 'boom' }
    )
    expect(failed.steps.hosts).toEqual({ status: 'error', message: 'boom' })

    const aborted = wizardReducer(failed, {
      type: 'stepRunAborted',
      stepId: 'hosts',
    })
    expect(aborted.steps.hosts).toEqual({ status: 'aborted' })
  })
})

describe('isStepReachable', () => {
  it('marks completed steps and the next step as reachable', () => {
    const state = stateWithCompleted('hosts', 'autocorrelation')

    expect(isStepReachable(state, 'hosts')).toBe(true)
    expect(isStepReachable(state, 'autocorrelation')).toBe(true)
    expect(isStepReachable(state, 'parameterization')).toBe(true)
    expect(isStepReachable(state, 'thresholds')).toBe(false)
  })

  it('only the first step is reachable when nothing is completed', () => {
    const state: WizardState = { ...initialWizardState, screen: 'wizard' }

    expect(isStepReachable(state, 'hosts')).toBe(true)
    expect(isStepReachable(state, 'autocorrelation')).toBe(false)
  })
})
