import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initialWizardState } from './state/reducer'
import { SetupWizardProvider } from './state/SetupWizardContext'
import { StepId, StepState, WizardState } from './state/types'
import { WizardShell } from './WizardShell'

vi.mock('@/components/Assistant/AssistantAuthGate', () => ({
  AssistantAuthGate: () => <div data-testid="auth-gate">gate</div>,
}))

vi.mock('./steps/HostsStep/HostsStep', () => ({
  HostsStep: () => <div data-testid="hosts-step" />,
}))
vi.mock('./steps/RunTestStep/RunTestStep', () => ({
  RunTestStep: () => <div data-testid="run-test-step" />,
}))

const shellProps = {
  script: { valid: true, preview: '' } as const,
  scriptName: 'test.k6g',
  onSaveGenerator: vi.fn(),
  onComplete: vi.fn(),
}

function completed(): StepState {
  return {
    status: 'completed',
    result: { step: 'hosts', suggestions: [] },
    log: [],
    summary: 'done',
  }
}

function renderShell(activeStep: StepId, completedSteps: StepId[] = []) {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep,
    steps: completedSteps.reduce(
      (steps, step) => ({ ...steps, [step]: completed() }),
      { ...initialWizardState.steps }
    ),
  }

  return render(
    <Theme>
      <SetupWizardProvider initialState={state}>
        <WizardShell {...shellProps} />
      </SetupWizardProvider>
    </Theme>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('WizardShell', () => {
  it('gates agent steps behind the assistant auth gate', () => {
    renderShell('hosts')

    expect(screen.getByTestId('auth-gate')).toBeDefined()
    expect(screen.queryByTestId('hosts-step')).toBeNull()
  })

  it('does not gate the run test step', () => {
    renderShell('runTest', [
      'hosts',
      'autocorrelation',
      'parameterization',
      'thresholds',
    ])

    expect(screen.getByTestId('run-test-step')).toBeDefined()
    expect(screen.queryByTestId('auth-gate')).toBeNull()
  })
})
