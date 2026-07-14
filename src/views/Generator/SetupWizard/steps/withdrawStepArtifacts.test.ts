import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { createThreshold } from '@/test/factories/threshold'
import { CorrelationRule } from '@/types/rules'

import { initialWizardState } from '../state/reducer'
import { StepState, WizardState } from '../state/types'

import {
  invalidateDownstreamSteps,
  withdrawStepArtifacts,
} from './withdrawStepArtifacts'

const correlationRule: CorrelationRule = {
  id: 'rule-1',
  type: 'correlation',
  enabled: true,
  extractor: {
    filter: { path: '' },
    selector: { type: 'begin-end', from: 'body', begin: 'a', end: 'b' },
    extractionMode: 'single',
  },
}

beforeEach(() => {
  useGeneratorStore.getState().resetGeneratorFile()
})

describe('withdrawStepArtifacts', () => {
  it('removes the rules committed by a completed autocorrelation step', () => {
    useGeneratorStore.setState({ rules: [correlationRule] })
    const stepState: StepState = {
      status: 'completed',
      result: {
        step: 'autocorrelation',
        entries: [
          {
            rule: correlationRule,
            correlationState: {
              extractedValue: 'value',
              count: 1,
              matchedRequestIds: [],
              responsesExtracted: [],
              requestsReplaced: [],
              generatedUniqueId: undefined,
            },
          },
        ],
      },
      log: [],
      summary: '1 correlation rule added',
    }

    withdrawStepArtifacts(stepState)

    expect(useGeneratorStore.getState().rules).toEqual([])
  })

  it('removes the rules and added variables of a parameterization step', () => {
    const paramRule: CorrelationRule = { ...correlationRule, id: 'param-1' }
    useGeneratorStore.setState({
      rules: [paramRule],
      variables: [
        { name: 'added', value: '1' },
        { name: 'pre-existing', value: '2' },
      ],
    })
    const stepState: StepState = {
      status: 'completed',
      result: {
        step: 'parameterization',
        suggestions: [
          {
            ruleId: 'param-1',
            field: 'added',
            location: { method: 'POST', path: '/login', in: 'body' },
            recordedValue: 'secret',
          },
        ],
        addedVariableNames: ['added'],
      },
      log: [],
      summary: '',
    }

    withdrawStepArtifacts(stepState)

    expect(useGeneratorStore.getState().rules).toEqual([])
    expect(useGeneratorStore.getState().variables).toEqual([
      { name: 'pre-existing', value: '2' },
    ])
  })

  it('removes the thresholds committed by a thresholds step', () => {
    const committed = createThreshold({ id: 'committed' })
    const own = createThreshold({ id: 'own' })
    useGeneratorStore.setState({ thresholds: [committed, own] })
    const stepState: StepState = {
      status: 'completed',
      result: {
        step: 'thresholds',
        rationaleById: { committed: 'observed p95' },
      },
      log: [],
      summary: '',
    }

    withdrawStepArtifacts(stepState)

    expect(useGeneratorStore.getState().thresholds).toEqual([own])
  })

  it('ignores steps that are not completed', () => {
    useGeneratorStore.setState({ rules: [correlationRule] })

    withdrawStepArtifacts({ status: 'not-started' })

    expect(useGeneratorStore.getState().rules).toEqual([correlationRule])
  })
})

describe('invalidateDownstreamSteps', () => {
  function completedThresholds(): StepState {
    return {
      status: 'completed',
      result: { step: 'thresholds', rationaleById: { t1: 'why' } },
      log: [],
      summary: '',
    }
  }

  function stateWith(steps: Record<string, StepState>): WizardState {
    return {
      ...initialWizardState,
      screen: 'wizard',
      steps: { ...initialWizardState.steps, ...steps },
    }
  }

  it('withdraws artifacts and dispatches when a downstream step is completed', () => {
    useGeneratorStore.setState({
      thresholds: [createThreshold({ id: 't1' })],
    })
    const dispatch = vi.fn()

    invalidateDownstreamSteps(
      'hosts',
      stateWith({ thresholds: completedThresholds() }),
      dispatch
    )

    expect(useGeneratorStore.getState().thresholds).toEqual([])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'invalidateStepsAfter',
      stepId: 'hosts',
    })
  })

  it('does nothing when every downstream step is untouched', () => {
    const dispatch = vi.fn()

    invalidateDownstreamSteps('hosts', stateWith({}), dispatch)

    expect(dispatch).not.toHaveBeenCalled()
  })
})
