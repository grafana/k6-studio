import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { CorrelationRule } from '@/types/rules'

import { initialWizardState } from '../../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../../state/SetupWizardContext'
import { HostSuggestion, WizardState } from '../../state/types'

import { HostsStep } from './HostsStep'
import { useHostsAgent } from './useHostsAgent'

vi.mock('./useHostsAgent', () => ({ useHostsAgent: vi.fn() }))

const suggestions: HostSuggestion[] = [
  {
    host: 'api.example.com',
    category: 'api',
    suggested: true,
    reason: 'Primary backend.',
    requestCount: 6,
  },
  {
    host: 'cdn.example.com',
    category: 'cdn',
    suggested: false,
    reason: 'Static assets.',
    requestCount: 2,
  },
]

function mockAgent(overrides: Partial<ReturnType<typeof useHostsAgent>> = {}) {
  const agent = {
    start: vi.fn(),
    restart: vi.fn(),
    stop: vi.fn(),
    status: 'not-started',
    error: undefined,
    actionsLog: { entries: [] },
    ...overrides,
  } as ReturnType<typeof useHostsAgent>

  vi.mocked(useHostsAgent).mockReturnValue(agent)

  return agent
}

const committedRule: CorrelationRule = {
  id: 'committed-rule',
  type: 'correlation',
  enabled: true,
  extractor: {
    filter: { path: '' },
    selector: { type: 'begin-end', from: 'body', begin: 'a', end: 'b' },
    extractionMode: 'single',
  },
}

const committedEntry = {
  rule: committedRule,
  correlationState: {
    extractedValue: 'value',
    count: 1,
    matchedRequestIds: [],
    responsesExtracted: [],
    requestsReplaced: [],
    generatedUniqueId: undefined,
  },
}

function StateProbe() {
  const { state } = useSetupWizard()

  return (
    <div data-testid="probe">
      {state.steps.autocorrelation.status}:{state.steps.thresholds.status}
    </div>
  )
}

function renderStep(stepStates: Partial<WizardState['steps']> = {}) {
  const state: WizardState = {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'hosts',
    steps: { ...initialWizardState.steps, ...stepStates },
  }

  return render(
    <SetupWizardProvider initialState={state}>
      <HostsStep />
      <StateProbe />
    </SetupWizardProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAgent()
  useGeneratorStore.setState({
    allowlist: ['api.example.com'],
    includeStaticAssets: false,
  })
})

describe('HostsStep', () => {
  it('starts the agent when the step has not run yet', () => {
    const agent = mockAgent()

    renderStep()

    expect(agent.start).toHaveBeenCalledOnce()
  })

  it('does not re-run the agent when revisiting a completed step', () => {
    const agent = mockAgent()

    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
    })

    expect(agent.start).not.toHaveBeenCalled()
  })

  it('renders host rows bound to the allowlist when completed', () => {
    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
    })

    expect(
      screen.getByText('Recommended 1 of 2 hosts for the load test')
    ).toBeDefined()
    expect(screen.getByText('1 of 2 hosts included')).toBeDefined()
    expect(
      screen
        .getByRole('checkbox', { name: 'Include api.example.com' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen
        .getByRole('checkbox', { name: 'Include cdn.example.com' })
        .getAttribute('aria-checked')
    ).toBe('false')
  })

  it('updates the allowlist when a host is toggled', async () => {
    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
    })

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Include cdn.example.com' })
    )

    expect(useGeneratorStore.getState().allowlist).toEqual([
      'api.example.com',
      'cdn.example.com',
    ])
  })

  it('invalidates downstream analyses when the host selection changes', async () => {
    // A rule the completed autocorrelation step committed for the old host set.
    useGeneratorStore.setState({ rules: [committedRule] })
    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
      autocorrelation: {
        status: 'completed',
        result: { step: 'autocorrelation', entries: [committedEntry] },
        log: [],
        summary: '1 correlation rule added',
      },
      thresholds: {
        status: 'completed',
        result: { step: 'thresholds', rationaleById: {} },
        log: [],
        summary: 'Suggested thresholds',
      },
    })

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Include cdn.example.com' })
    )

    // Downstream runs no longer apply to the new host set: their steps reset
    // and their committed artifacts are withdrawn.
    expect(screen.getByTestId('probe').textContent).toBe(
      'not-started:not-started'
    )
    expect(useGeneratorStore.getState().rules).toEqual([])
  })

  it('does not disturb downstream steps that never ran', async () => {
    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
    })

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Include cdn.example.com' })
    )

    expect(screen.getByTestId('probe').textContent).toBe(
      'not-started:not-started'
    )
    expect(useGeneratorStore.getState().allowlist).toContain('cdn.example.com')
  })

  it('disables Continue when no hosts are included', () => {
    useGeneratorStore.setState({ allowlist: [] })

    renderStep({
      hosts: {
        status: 'completed',
        result: { step: 'hosts', suggestions },
        log: [],
        summary: 'Recommended 1 of 2 hosts for the load test',
      },
    })

    expect(screen.getByRole('button', { name: /Continue/ })).toHaveProperty(
      'disabled',
      true
    )
  })
})
