import { Theme } from '@radix-ui/themes'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { createThreshold } from '@/test/factories/threshold'

import { initialWizardState } from '../../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../../state/SetupWizardContext'
import { StepState, WizardState } from '../../state/types'

import { ThresholdsStep } from './ThresholdsStep'

interface StepToolCall {
  type: 'tool-call'
  toolName: string
  toolCallId: string
  input: unknown
}
// useStepAgent hands the step's handleToolCall straight to useAssistantAgent.
type OnToolCall = (toolCall: StepToolCall) => unknown

const agentMock = vi.hoisted(() => ({
  status: 'running',
  onToolCall: undefined as OnToolCall | undefined,
  start: vi.fn(),
}))

vi.mock('@/utils/assistant/useAssistantAgent', () => ({
  useAssistantAgent: (options: { onToolCall: OnToolCall }) => {
    agentMock.onToolCall = options.onToolCall
    return {
      start: agentMock.start,
      stop: vi.fn(),
      reset: vi.fn(),
      status: agentMock.status,
      error: undefined,
      actionsLog: {
        entries: [],
        addEntry: vi.fn(() => ({ id: 'log-1' })),
        markLastReasoningAsOutcome: vi.fn(),
      },
    }
  },
}))

const completedHosts: StepState = {
  status: 'completed',
  result: { step: 'hosts', suggestions: [] },
  log: [],
  summary: 'done',
}

function StateProbe() {
  const { state } = useSetupWizard()
  const thresholdsStep = state.steps.thresholds

  if (thresholdsStep === undefined) {
    return null
  }

  return (
    <>
      <div data-testid="probe">{thresholdsStep.status}</div>
      <div data-testid="result">
        {JSON.stringify(
          thresholdsStep.status === 'completed' ? thresholdsStep.result : null
        )}
      </div>
    </>
  )
}

function App({
  thresholdsStep = { status: 'running' },
}: {
  thresholdsStep?: StepState
}) {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'thresholds',
    steps: {
      ...initialWizardState.steps,
      hosts: completedHosts,
      thresholds: thresholdsStep,
    },
  }

  return (
    <Theme>
      <SetupWizardProvider initialState={state}>
        <ThresholdsStep />
        <StateProbe />
      </SetupWizardProvider>
    </Theme>
  )
}

const suggestion = {
  metric: 'http_req_duration',
  statistic: 'p(95)',
  condition: '<',
  value: 300,
  stopTest: false,
  rationale: 'Observed p95 was 250ms',
}

beforeEach(() => {
  vi.clearAllMocks()
  agentMock.status = 'running'
  agentMock.onToolCall = undefined
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  useGeneratorStore.setState({
    requests: [],
    thresholds: [],
    wizardUsed: false,
  })
})

describe('useThresholdsAgent completion', () => {
  it('discards proposals and fails the step when finish reports failure', () => {
    const { rerender } = render(<App />)

    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'suggestThresholds',
        toolCallId: 't1',
        input: { thresholds: [suggestion] },
      })
    })
    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't2',
        input: { outcome: 'failure' },
      })
    })

    agentMock.status = 'completed'
    rerender(<App />)

    expect(screen.getByTestId('probe').textContent).toBe('error')
    expect(useGeneratorStore.getState().thresholds).toEqual([])
    expect(useGeneratorStore.getState().wizardUsed).toBe(false)
    expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_step_finished',
      payload: {
        step: 'thresholds',
        outcome: 'failure',
        durationMs: undefined,
      },
    })
  })

  it('rejects a finish call with an outcome outside the enum', () => {
    render(<App />)

    expect(() =>
      agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't9',
        input: { outcome: 'completed' },
      })
    ).toThrow()

    // No usage event fires for an unknown outcome.
    expect(window.studio.app.trackEvent).not.toHaveBeenCalled()
  })

  it('snapshots pre-existing thresholds and keeps them out of the step', () => {
    useGeneratorStore.setState({
      thresholds: [createThreshold({ id: 'pre-1' })],
    })

    const { rerender } = render(<App />)

    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'suggestThresholds',
        toolCallId: 't1',
        input: { thresholds: [suggestion] },
      })
    })
    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't2',
        input: { outcome: 'success' },
      })
    })

    agentMock.status = 'completed'
    rerender(<App />)

    // Both survive in the store; the result records which one pre-dates the
    // step so the completed view and withdrawal leave it alone.
    expect(useGeneratorStore.getState().thresholds).toHaveLength(2)
    const result: unknown = JSON.parse(
      screen.getByTestId('result').textContent ?? 'null'
    )
    expect(result).toMatchObject({ preexistingIds: ['pre-1'] })
  })

  it('tells the agent about thresholds the test already defines', () => {
    useGeneratorStore.setState({
      thresholds: [createThreshold({ id: 'pre-1', statistic: 'p(99)' })],
    })

    // Starting from not-started lets the auto-start effect kick off the run.
    render(<App thresholdsStep={{ status: 'not-started' }} />)

    expect(agentMock.start).toHaveBeenCalled()
    const prompt: unknown = agentMock.start.mock.calls.at(-1)![0]
    expect(prompt).toContain('already defines')
    expect(prompt).toContain('p(99)')
  })

  it('commits proposals when finish reports success', () => {
    const { rerender } = render(<App />)

    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'suggestThresholds',
        toolCallId: 't1',
        input: { thresholds: [suggestion] },
      })
    })
    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't2',
        input: { outcome: 'success' },
      })
    })

    agentMock.status = 'completed'
    rerender(<App />)

    expect(screen.getByTestId('probe').textContent).toBe('completed')
    expect(useGeneratorStore.getState().thresholds).toHaveLength(1)
    expect(useGeneratorStore.getState().wizardUsed).toBe(true)
    expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_step_finished',
      payload: {
        step: 'thresholds',
        outcome: 'success',
        durationMs: undefined,
      },
    })
  })
})
