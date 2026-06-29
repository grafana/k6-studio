import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { initialWizardState } from './state/reducer'
import { SetupWizardProvider } from './state/SetupWizardContext'
import { StepState, WizardState } from './state/types'
import { Stepper } from './Stepper'

const completed: StepState = {
  status: 'completed',
  result: { step: 'hosts', suggestions: [] },
  log: [],
  summary: 'done',
}

function renderStepper(state?: Partial<WizardState>) {
  return render(
    <SetupWizardProvider
      initialState={{ ...initialWizardState, screen: 'wizard', ...state }}
    >
      <Stepper />
    </SetupWizardProvider>
  )
}

describe('Stepper', () => {
  it('renders all steps', () => {
    renderStepper()

    expect(screen.getByText('Select hosts')).toBeDefined()
    expect(screen.getByText('Autocorrelation')).toBeDefined()
    expect(screen.getByText('Parameterization')).toBeDefined()
    expect(screen.getByText('Thresholds')).toBeDefined()
    expect(screen.getByText('Run test')).toBeDefined()
  })

  it('marks the active step with aria-current', () => {
    renderStepper()

    expect(
      screen
        .getByRole('button', { name: 'Step 1: Select hosts' })
        .getAttribute('aria-current')
    ).toBe('step')
  })

  it('disables steps that are not reachable yet', () => {
    renderStepper()

    expect(
      screen.getByRole('button', { name: 'Step 2: Autocorrelation' })
    ).toHaveProperty('disabled', true)
  })

  it('navigates to a completed step when clicked', async () => {
    renderStepper({
      activeStep: 'autocorrelation',
      steps: { ...initialWizardState.steps, hosts: completed },
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Step 1: Select hosts' })
    )

    expect(
      screen
        .getByRole('button', { name: 'Step 1: Select hosts' })
        .getAttribute('aria-current')
    ).toBe('step')
  })
})
