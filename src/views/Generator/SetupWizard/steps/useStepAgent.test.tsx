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

const agentMock = vi.hoisted(() => ({ status: 'running' }))

vi.mock('@/utils/assistant/useAssistantAgent', () => ({
  useAssistantAgent: () => ({
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
  }),
}))

function ActiveStep() {
  const { state } = useSetupWizard()

  if (state.activeStep === 'hosts') {
    return <HostsStep />
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
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  agentMock.status = 'running'
  useGeneratorStore.setState({ requests: [], allowlist: [], wizardUsed: false })
})

describe('useStepAgent', () => {
  it('keeps the step completed when skipping mid-run unmounts it', async () => {
    renderWizard()

    // Skip is clicked while the agent is still running; the same handler advances
    // to the next step, unmounting this one. The unmount must not re-abort the
    // step the skip just completed.
    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(screen.getByTestId('after-hosts').textContent).toBe(
      'autocorrelation:completed'
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

  it('marks the generator as wizard-configured when the agent completes a step', () => {
    agentMock.status = 'completed'

    renderWizard()

    expect(useGeneratorStore.getState().wizardUsed).toBe(true)
  })

  it('does not mark the generator when the step is skipped', async () => {
    renderWizard()

    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(useGeneratorStore.getState().wizardUsed).toBe(false)
  })
})
