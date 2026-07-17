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
    onStatusChange,
    close,
  }: {
    footer?: (context: AutoCorrelationFooterContext) => React.ReactNode
    onSettled?: (context: AutoCorrelationFooterContext) => void
    onStatusChange?: (status: string) => void
    close: () => void
  }) => (
    <div data-testid="auto-correlation">
      {footer?.(footerContext)}
      <button type="button" onClick={() => onSettled?.(footerContext)}>
        settle-run
      </button>
      <button type="button" onClick={() => onStatusChange?.('not-started')}>
        reset-run
      </button>
      <button type="button" onClick={close}>
        close-run
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
  useGeneratorStore.setState({ rules: [], wizardUsed: false })
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
      'parameterization:skipped'
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

  it('settles the run before navigating when the embedded flow closes itself', async () => {
    renderStep({ autocorrelation: { status: 'running' } })

    // The error screens' Close ends the run; the step must record the abort
    // first so the running-navigation lock does not swallow the back action.
    await userEvent.click(screen.getByRole('button', { name: 'close-run' }))

    expect(screen.getByTestId('probe').textContent).toBe('hosts:aborted')
  })

  it('aborts a running step when navigating away mid-run', () => {
    const state: WizardState = {
      ...initialWizardState,
      screen: 'wizard',
      activeStep: 'autocorrelation',
      steps: {
        ...initialWizardState.steps,
        hosts: completedHosts,
        autocorrelation: { status: 'running' },
      },
    }

    function App({ mounted }: { mounted: boolean }) {
      return (
        <Theme>
          <SetupWizardProvider initialState={state}>
            {mounted && <AutocorrelationStep />}
            <StateProbe />
          </SetupWizardProvider>
        </Theme>
      )
    }

    const { rerender } = render(<App mounted />)
    rerender(<App mounted={false} />)

    expect(screen.getByTestId('probe').textContent).toBe(
      'autocorrelation:aborted'
    )
  })

  it('aborts a running step when the proxy drops, and recovery waits for the user', () => {
    const state: WizardState = {
      ...initialWizardState,
      screen: 'wizard',
      activeStep: 'autocorrelation',
      steps: {
        ...initialWizardState.steps,
        hosts: completedHosts,
        autocorrelation: { status: 'running' },
      },
    }

    function App() {
      return (
        <Theme>
          <SetupWizardProvider initialState={state}>
            <AutocorrelationStep />
            <StateProbe />
          </SetupWizardProvider>
        </Theme>
      )
    }

    const { rerender } = render(<App />)

    // The proxy dies mid-run: the live analysis unmounts and the step must
    // reconcile to 'aborted' rather than staying 'running'.
    vi.mocked(useProxyStatus).mockReturnValue('offline')
    rerender(<App />)

    expect(screen.getByTestId('probe').textContent).toBe(
      'autocorrelation:aborted'
    )

    // When the proxy comes back the step offers recovery instead of silently
    // auto-starting a fresh full replay.
    vi.mocked(useProxyStatus).mockReturnValue('online')
    rerender(<App />)

    expect(screen.queryByTestId('auto-correlation')).toBeNull()
    expect(screen.getByRole('button', { name: /Run analysis/ })).toBeDefined()
  })

  it('offers recovery when the embedded run is reset mid-run', async () => {
    // The error state's "Go back" resets the analysis to not-started, but the
    // one-shot auto-start will not revive it; the step must fall back to the
    // interrupted prompt instead of an idle empty view.
    renderStep({ autocorrelation: { status: 'running' } })

    await userEvent.click(screen.getByRole('button', { name: 'reset-run' }))

    expect(screen.getByTestId('probe').textContent).toBe(
      'autocorrelation:aborted'
    )
    expect(screen.getByRole('button', { name: /Run analysis/ })).toBeDefined()
  })

  it('does not auto-restart analysis when returning to an interrupted step', async () => {
    renderStep({ autocorrelation: { status: 'aborted' } })

    // A live AutoCorrelation would auto-start a fresh analysis; it must not mount.
    expect(screen.queryByTestId('auto-correlation')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Run analysis/ }))

    // Re-running is user-initiated: reset to not-started mounts the live run.
    expect(screen.getByTestId('auto-correlation')).toBeDefined()
    expect(screen.getByTestId('probe').textContent).toBe(
      'autocorrelation:not-started'
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

  it('marks the generator as wizard-configured when the run settles', async () => {
    footerContext.ruleEntries = [ruleEntry]

    renderStep()

    await userEvent.click(screen.getByRole('button', { name: 'settle-run' }))

    expect(useGeneratorStore.getState().wizardUsed).toBe(true)
    expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_step_finished',
      payload: {
        step: 'autocorrelation',
        outcome: 'success',
        durationMs: undefined,
      },
    })
  })

  it('tracks a skipped outcome when the step is skipped', async () => {
    renderStep()

    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(window.studio.app.trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_step_finished',
      payload: {
        step: 'autocorrelation',
        outcome: 'skipped',
        durationMs: undefined,
      },
    })
  })

  it('does not mark the generator when the step is skipped', async () => {
    renderStep()

    await userEvent.click(screen.getByRole('button', { name: 'Skip step' }))

    expect(useGeneratorStore.getState().wizardUsed).toBe(false)
  })

  it('disables an accepted rule via the toggle without removing it', async () => {
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
      screen.getByRole('switch', { name: /Enable .* rule/ })
    )

    // The rule stays in the store; disabling is the opt-out, not removal.
    expect(useGeneratorStore.getState().rules).toMatchObject([
      { id: 'rule-1', enabled: false },
    ])
    expect(screen.getByText('a...b')).toBeDefined()
  })
})
