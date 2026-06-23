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

vi.mock('@/utils/assistant/useAssistantAgent', () => ({
  useAssistantAgent: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    status: 'running',
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
  useGeneratorStore.setState({ requests: [], allowlist: [] })
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
  })
})
