import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProxyStatus } from '@/hooks/useProxyStatus'
import { CorrelationRule } from '@/types/rules'
import type { AutoCorrelationFooterContext } from '@/views/Generator/AutoCorrelation/AutoCorrelation'

import { initialWizardState } from '../../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../../state/SetupWizardContext'
import { StepState, WizardState } from '../../state/types'

import { AutocorrelationStep } from './AutocorrelationStep'

vi.mock('@/hooks/useProxyStatus', () => ({ useProxyStatus: vi.fn() }))

const footerContext: AutoCorrelationFooterContext = {
  isLoading: false,
  ruleEntries: [],
  logEntries: [],
  correlationStatus: 'success',
  stop: vi.fn(),
  accept: vi.fn(),
}

vi.mock('@/views/Generator/AutoCorrelation/AutoCorrelation', () => ({
  AutoCorrelation: ({
    footer,
  }: {
    footer?: (context: AutoCorrelationFooterContext) => React.ReactNode
  }) => <div data-testid="auto-correlation">{footer?.(footerContext)}</div>,
}))

const rule: CorrelationRule = {
  id: 'rule-1',
  type: 'correlation',
  enabled: true,
  extractor: {
    filter: { path: '' },
    selector: { type: 'begin-end', from: 'body', begin: 'a', end: 'b' },
    extractionMode: 'single',
  },
}

const completedHosts: StepState = {
  status: 'completed',
  result: { step: 'hosts', suggestions: [] },
  log: [],
  summary: 'done',
}

function StateProbe() {
  const { state } = useSetupWizard()

  return (
    <div data-testid="probe">
      {state.activeStep}:{state.steps.autocorrelation.status}
    </div>
  )
}

function renderStep(stepStates: Partial<WizardState['steps']> = {}) {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'autocorrelation',
    steps: {
      ...initialWizardState.steps,
      hosts: completedHosts,
      ...stepStates,
    },
  }

  return render(
    <SetupWizardProvider initialState={state}>
      <AutocorrelationStep />
      <StateProbe />
    </SetupWizardProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useProxyStatus).mockReturnValue('online')
  footerContext.isLoading = false
  footerContext.correlationStatus = 'success'
  footerContext.ruleEntries = []
})

describe('AutocorrelationStep', () => {
  it('lets the user skip the step when the proxy is offline', async () => {
    vi.mocked(useProxyStatus).mockReturnValue('offline')

    renderStep()

    expect(screen.queryByTestId('auto-correlation')).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: 'Skip this step' })
    )

    expect(screen.getByTestId('probe').textContent).toBe(
      'parameterization:completed'
    )
  })

  it('shows the stored summary when revisiting a completed step', () => {
    renderStep({
      autocorrelation: {
        status: 'completed',
        result: { step: 'autocorrelation', ruleIds: ['rule-1'] },
        log: [],
        summary: '1 correlation rule added',
      },
    })

    expect(screen.queryByTestId('auto-correlation')).toBeNull()
    expect(screen.getByText('1 correlation rule added')).toBeDefined()
    expect(screen.getByRole('button', { name: /Continue/ })).toHaveProperty(
      'disabled',
      false
    )
  })

  it('disables Continue while the agent is running', () => {
    footerContext.isLoading = true
    footerContext.correlationStatus = 'analyzing'

    renderStep()

    expect(screen.getByRole('button', { name: /Continue/ })).toHaveProperty(
      'disabled',
      true
    )
  })

  it('accepts rules and advances on Continue', async () => {
    footerContext.ruleEntries = [
      {
        rule,
        correlationState: {
          extractedValue: 'value',
          count: 1,
          matchedRequestIds: ['req-1'],
          responsesExtracted: [],
          requestsReplaced: [],
          generatedUniqueId: undefined,
        },
      },
    ]

    renderStep()

    await userEvent.click(screen.getByRole('button', { name: /Continue/ }))

    expect(footerContext.accept).toHaveBeenCalledOnce()
    expect(screen.getByTestId('probe').textContent).toBe(
      'parameterization:completed'
    )
  })
})
