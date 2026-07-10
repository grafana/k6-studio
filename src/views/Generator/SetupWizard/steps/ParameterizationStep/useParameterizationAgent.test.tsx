import { Theme } from '@radix-ui/themes'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'

import { initialWizardState } from '../../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../../state/SetupWizardContext'
import { StepState, WizardState } from '../../state/types'

import { ParameterizationStep } from './ParameterizationStep'

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
}))

vi.mock('@/utils/assistant/useAssistantAgent', () => ({
  useAssistantAgent: (options: { onToolCall: OnToolCall }) => {
    agentMock.onToolCall = options.onToolCall
    return {
      start: vi.fn(),
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

  return <div data-testid="probe">{state.steps.parameterization.status}</div>
}

function App() {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'parameterization',
    steps: {
      ...initialWizardState.steps,
      hosts: completedHosts,
      parameterization: { status: 'running' },
    },
  }

  return (
    <Theme>
      <SetupWizardProvider initialState={state}>
        <ParameterizationStep />
        <StateProbe />
      </SetupWizardProvider>
    </Theme>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  agentMock.status = 'running'
  agentMock.onToolCall = undefined
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  useGeneratorStore.setState({ requests: [], rules: [], variables: [] })
})

describe('useParameterizationAgent completion', () => {
  it('fails the step when finish reports failure', () => {
    const { rerender } = render(<App />)

    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't1',
        input: { outcome: 'failure' },
      })
    })

    agentMock.status = 'completed'
    rerender(<App />)

    expect(screen.getByTestId('probe').textContent).toBe('error')
    expect(useGeneratorStore.getState().rules).toEqual([])
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

  it('completes with no proposals when finish reports success', () => {
    const { rerender } = render(<App />)

    act(() => {
      void agentMock.onToolCall!({
        type: 'tool-call',
        toolName: 'finish',
        toolCallId: 't1',
        input: { outcome: 'success' },
      })
    })

    agentMock.status = 'completed'
    rerender(<App />)

    expect(screen.getByTestId('probe').textContent).toBe('completed')
  })
})
