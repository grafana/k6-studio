import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useGeneratorStore } from '@/store/generator'
import { CorrelationRule } from '@/types/rules'
import type { AutoCorrelationFooterContext } from '@/views/Generator/AutoCorrelation/AutoCorrelation'
import type { SuggestedRuleEntry } from '@/views/Generator/AutoCorrelation/types'

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
    onSettled,
  }: {
    footer?: (context: AutoCorrelationFooterContext) => React.ReactNode
    onSettled?: (context: AutoCorrelationFooterContext) => void
  }) => (
    <div data-testid="auto-correlation">
      {footer?.(footerContext)}
      <button type="button" onClick={() => onSettled?.(footerContext)}>
        settle-run
      </button>
    </div>
  ),
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

const ruleEntry: SuggestedRuleEntry = {
  rule,
  correlationState: {
    extractedValue: 'value',
    count: 1,
    matchedRequestIds: ['req-1'],
    responsesExtracted: [],
    requestsReplaced: [],
    generatedUniqueId: undefined,
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
    <Theme>
      <SetupWizardProvider initialState={state}>
        <AutocorrelationStep />
        <StateProbe />
      </SetupWizardProvider>
    </Theme>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  vi.mocked(useProxyStatus).mockReturnValue('online')
  useGeneratorStore.setState({ rules: [] })
  footerContext.isLoading = false
  footerContext.correlationStatus = 'success'
  footerContext.ruleEntries = []
})

describe('AutocorrelationStep', () => {
  it('lets the user skip the step when the proxy is offline', async () => {
    vi.mocked(useProxyStatus).mockReturnValue('offline')

    renderStep()

    expect(screen.queryByTestId('auto-correlation')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(screen.getByTestId('probe').textContent).toBe(
      'parameterization:completed'
    )
  })

  it('shows the stored summary and rule cards when revisiting a completed step', () => {
    renderStep({
      autocorrelation: {
        status: 'completed',
        result: { step: 'autocorrelation', entries: [ruleEntry] },
        log: [],
        summary: '1 correlation rule added',
      },
    })

    expect(screen.queryByTestId('auto-correlation')).toBeNull()
    expect(screen.getByText('1 correlation rule added')).toBeDefined()
    expect(screen.getByText('a...b')).toBeDefined()
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

  it('commits rules and switches to the completed view when the run settles', async () => {
    footerContext.ruleEntries = [ruleEntry]

    renderStep()

    await userEvent.click(screen.getByRole('button', { name: 'settle-run' }))

    expect(footerContext.accept).toHaveBeenCalledOnce()
    expect(screen.getByTestId('probe').textContent).toBe(
      'autocorrelation:completed'
    )
    expect(screen.getByText('1 correlation rule added')).toBeDefined()
    expect(screen.getByText('a...b')).toBeDefined()
  })

  it('removes an accepted rule from the store and the completed view', async () => {
    useGeneratorStore.setState({ rules: [rule] })

    renderStep({
      autocorrelation: {
        status: 'completed',
        result: { step: 'autocorrelation', entries: [ruleEntry] },
        log: [],
        summary: '1 correlation rule added',
      },
    })

    await userEvent.click(
      screen.getByRole('button', { name: /Remove .* rule/ })
    )

    expect(useGeneratorStore.getState().rules).toEqual([])
    expect(screen.queryByText('a...b')).toBeNull()
    expect(screen.getByText('0 correlation rules added')).toBeDefined()
  })
})
