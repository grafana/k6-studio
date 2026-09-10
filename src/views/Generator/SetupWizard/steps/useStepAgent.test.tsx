import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'

import { initialWizardState } from '../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../state/SetupWizardContext'
import { WizardState } from '../state/types'

import { HostsStep } from './HostsStep/HostsStep'

const agentMock = vi.hoisted(() => ({
  status: 'running',
  stop: vi.fn(),
  error: undefined as Error | undefined,
}))

const { invalidateAuthStatusMock } = vi.hoisted(() => ({
  invalidateAuthStatusMock: vi.fn(),
}))

vi.mock('@/hooks/useAssistantAuth', () => ({
  invalidateAssistantAuthStatus: invalidateAuthStatusMock,
}))

vi.mock('@/utils/assistant/useAssistantAgent', () => ({
  useAssistantAgent: () => ({
    start: vi.fn(),
    stop: agentMock.stop,
    reset: vi.fn(),
    status: agentMock.status,
    error: agentMock.error,
    actionsLog: {
      entries: [],
      addEntry: vi.fn(() => ({ id: 'log-1' })),
      markLastReasoningAsOutcome: vi.fn(),
    },
  }),
}))

function ActiveStep() {
  const { state } = useSetupWizard()

  if (state.activeStep === 'hosts') {
    return (
      <>
        <HostsStep />
        <div data-testid="hosts-status">{state.steps.hosts.status}</div>
      </>
    )
  }

  return (
    <div data-testid="after-hosts">
      {state.activeStep}:{state.steps.hosts.status}
    </div>
  )
}

function renderWizard() {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'hosts',
    steps: { ...initialWizardState.steps, hosts: { status: 'running' } },
  }

  return render(
    <SetupWizardProvider initialState={state}>
      <ActiveStep />
    </SetupWizardProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  agentMock.error = undefined
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  agentMock.status = 'running'
  agentMock.stop = vi.fn()
  useGeneratorStore.setState({ requests: [], allowlist: [], wizardUsed: false })
})

describe('useStepAgent', () => {
  it('keeps the step skipped when skipping mid-run unmounts it', async () => {
    renderWizard()

    // Skip is clicked while the agent is still running; the same handler advances
    // to the next step, unmounting this one. The unmount must not re-abort the
    // step the skip just finished.
    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(screen.getByTestId('after-hosts').textContent).toBe(
      'autocorrelation:skipped'
    )
    expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_step_finished',
      payload: { step: 'hosts', outcome: 'skipped', durationMs: undefined },
    })
  })

  it('tracks step_started when a run begins', async () => {
    const state: WizardState = {
      ...initialWizardState,
      screen: 'wizard',
      activeStep: 'hosts',
    }

    render(
      <SetupWizardProvider initialState={state}>
        <ActiveStep />
      </SetupWizardProvider>
    )

    // The step auto-starts on mount when not started yet.
    await vi.waitFor(() =>
      expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
        event: 'test_setup_wizard_step_started',
        payload: { step: 'hosts' },
      })
    )
  })

  it('stops the agent when a running step unmounts', () => {
    function Wrapper({ mounted }: { mounted: boolean }) {
      const state: WizardState = {
        ...initialWizardState,
        screen: 'wizard',
        activeStep: 'hosts',
        steps: { ...initialWizardState.steps, hosts: { status: 'running' } },
      }
      return (
        <SetupWizardProvider initialState={state}>
          {mounted && <HostsStep />}
        </SetupWizardProvider>
      )
    }

    const { rerender } = render(<Wrapper mounted />)
    rerender(<Wrapper mounted={false} />)

    expect(agentMock.stop).toHaveBeenCalled()
  })

  it('does not mark the generator when the completed run failed', () => {
    // The hosts agent completed without classifying anything: dispatchCompletion
    // fails the step and commits nothing, so the generator is not
    // wizard-configured.
    agentMock.status = 'completed'

    renderWizard()

    expect(useGeneratorStore.getState().wizardUsed).toBe(false)
  })

  it('does not mark the generator when the step is skipped', async () => {
    renderWizard()

    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(useGeneratorStore.getState().wizardUsed).toBe(false)
  })

  it('re-checks auth when the session expired mid-run', () => {
    agentMock.status = 'error'
    // What getA2AConfig surfaces once the refresh has failed. The throw inside
    // refreshAndSaveTokens never reaches the renderer.
    agentMock.error = new Error(
      'Not authenticated with Grafana Assistant. Please connect to Grafana Assistant first.'
    )

    renderWizard()

    // The refreshed status flips the gate to its reconnect screen. The run is
    // recorded as interrupted rather than as a failed analysis, and stays
    // retryable once the user is back.
    expect(invalidateAuthStatusMock).toHaveBeenCalledOnce()
    expect(screen.getByTestId('hosts-status').textContent).toBe('aborted')
  })

  it('fails the step when the run errors for another reason', () => {
    agentMock.status = 'error'
    agentMock.error = new Error('boom')

    renderWizard()

    expect(screen.getByTestId('hosts-status').textContent).toBe('error')
    expect(invalidateAuthStatusMock).not.toHaveBeenCalled()
  })
})
