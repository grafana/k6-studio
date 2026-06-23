import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AgentRunStatus } from '@/utils/assistant/useAssistantAgent'

import { initialWizardState } from '../state/reducer'
import { SetupWizardProvider, useStepState } from '../state/SetupWizardContext'
import { WizardState } from '../state/types'

import { useStepAgentLifecycle } from './useStepAgentLifecycle'

function Lifecycle({ status }: { status: AgentRunStatus }) {
  useStepAgentLifecycle({
    stepId: 'hosts',
    status,
    onCompleted: vi.fn(),
    failureMessage: 'failed',
  })

  return null
}

function StatusProbe() {
  return <div data-testid="status">{useStepState('hosts').status}</div>
}

function stateWithHosts(hosts: WizardState['steps']['hosts']): WizardState {
  return {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'hosts',
    steps: { ...initialWizardState.steps, hosts },
  }
}

describe('useStepAgentLifecycle', () => {
  it('aborts a running step when the agent unmounts mid-run', () => {
    const initialState = stateWithHosts({ status: 'running' })

    function App({ mounted }: { mounted: boolean }) {
      return (
        <SetupWizardProvider initialState={initialState}>
          {mounted && <Lifecycle status="running" />}
          <StatusProbe />
        </SetupWizardProvider>
      )
    }

    const { rerender } = render(<App mounted />)
    expect(screen.getByTestId('status').textContent).toBe('running')

    rerender(<App mounted={false} />)
    expect(screen.getByTestId('status').textContent).toBe('aborted')
  })

  it('leaves a completed step untouched when it unmounts', () => {
    const initialState = stateWithHosts({
      status: 'completed',
      result: { step: 'hosts', suggestions: [] },
      log: [],
      summary: 'done',
    })

    function App({ mounted }: { mounted: boolean }) {
      return (
        <SetupWizardProvider initialState={initialState}>
          {mounted && <Lifecycle status="completed" />}
          <StatusProbe />
        </SetupWizardProvider>
      )
    }

    const { rerender } = render(<App mounted />)
    rerender(<App mounted={false} />)
    expect(screen.getByTestId('status').textContent).toBe('completed')
  })
})
