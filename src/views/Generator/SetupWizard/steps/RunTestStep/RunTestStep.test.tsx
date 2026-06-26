import { Theme } from '@radix-ui/themes'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { createProxyData, createRequest } from '@/test/factories/proxyData'
import { createThreshold } from '@/test/factories/threshold'

import { initialWizardState } from '../../state/reducer'
import { SetupWizardProvider } from '../../state/SetupWizardContext'
import { StepState, WizardState } from '../../state/types'

import { RunTestStep } from './RunTestStep'

vi.mock('@/components/Monaco/ReadOnlyEditor', () => ({
  ReadOnlyEditor: () => <div data-testid="script-preview" />,
}))

const runInCloudDialog = vi.hoisted(() => ({
  open: false,
  onRunStarted: undefined as (() => void) | undefined,
}))

vi.mock('@/components/RunInCloudDialog/RunInCloudDialog', () => ({
  RunInCloudDialog: ({
    open,
    onRunStarted,
  }: {
    open: boolean
    onRunStarted?: () => void
  }) => {
    runInCloudDialog.open = open
    runInCloudDialog.onRunStarted = onRunStarted
    return open ? <div data-testid="run-in-cloud-dialog" /> : null
  },
}))

vi.mock('@/hooks/useAuthStatus', () => ({
  useAuthStatus: () => ({
    type: 'signed-in',
    stack: { id: 1, name: 'mystack', url: 'https://mystack.grafana.net' },
  }),
}))

function completedStep(summary: string): StepState {
  return {
    status: 'completed',
    result: { step: 'hosts', suggestions: [] },
    log: [],
    summary,
  }
}

const wizardState: WizardState = {
  ...initialWizardState,
  screen: 'wizard',
  activeStep: 'runTest',
  steps: {
    hosts: completedStep('2 of 5 hosts selected'),
    autocorrelation: completedStep('3 correlation rules added'),
    parameterization: completedStep('2 values parameterized'),
    thresholds: completedStep('Suggested 3 thresholds'),
    runTest: { status: 'not-started' },
  },
}

const validScript = {
  valid: true,
  preview: 'export default function () {}',
} as const

function renderStep({
  script = validScript as typeof validScript | { valid: false; error: Error },
  onSave = vi.fn().mockResolvedValue({ type: 'file', path: '/test.k6g' }),
  onComplete = vi.fn(),
} = {}) {
  render(
    <Theme>
      <SetupWizardProvider initialState={wizardState}>
        <RunTestStep
          script={script}
          scriptName="test.k6g"
          onSave={onSave}
          onComplete={onComplete}
        />
      </SetupWizardProvider>
    </Theme>
  )

  return { onSave, onComplete }
}

beforeEach(() => {
  vi.clearAllMocks()
  runInCloudDialog.open = false
  runInCloudDialog.onRunStarted = undefined

  useGeneratorStore.setState({
    requests: [
      createProxyData({ request: createRequest({ host: 'example.com' }) }),
      createProxyData({ request: createRequest({ host: 'example.com' }) }),
    ],
    allowlist: ['example.com'],
    includeStaticAssets: true,
    executor: 'ramping-vus',
    stages: [
      { target: 20, duration: '1m' },
      { target: 20, duration: '3m30s' },
      { target: 0, duration: '1m' },
    ],
    thresholds: [
      createThreshold({ statistic: 'p(95)', condition: '<', value: 300 }),
    ],
  })
})

describe('RunTestStep', () => {
  it('shows the briefing and the assistant recap', () => {
    renderStep()

    expect(screen.getByText('2 requests across 1 host')).toBeDefined()
    expect(screen.getByText('example.com')).toBeDefined()
    expect(screen.getByText('Up to 20 virtual users for ~5m 30s')).toBeDefined()
    // Stage timeline under the load summary
    expect(screen.getByText('Ramp up')).toBeDefined()
    expect(screen.getByText('Steady')).toBeDefined()
    expect(screen.getByText('Ramp down')).toBeDefined()
    expect(screen.getByText('0 → 20 VUs')).toBeDefined()
    expect(screen.getByText('p95 < 300ms')).toBeDefined()
    expect(screen.getByText('3 correlation rules added')).toBeDefined()
    expect(screen.getByText(/mystack/)).toBeDefined()
  })

  it('goes to the generator without saving', async () => {
    const { onSave, onComplete } = renderStep()

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to generator' })
    )

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves and opens the cloud run dialog', async () => {
    const { onSave } = renderStep()

    await userEvent.click(screen.getByRole('button', { name: /Save & Run/ }))

    expect(onSave).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(screen.getByTestId('run-in-cloud-dialog')).toBeDefined()
    )
    expect(screen.getByRole('button', { name: /Save & Run/ })).toHaveProperty(
      'disabled',
      true
    )
  })

  it('completes the wizard when the cloud run starts', async () => {
    const { onComplete } = renderStep()

    await userEvent.click(screen.getByRole('button', { name: /Save & Run/ }))
    await waitFor(() => expect(runInCloudDialog.open).toBe(true))

    runInCloudDialog.onRunStarted?.()

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('stays on the step when saving fails', async () => {
    const { onComplete } = renderStep({
      onSave: vi.fn().mockRejectedValue(new Error('disk full')),
    })

    await userEvent.click(screen.getByRole('button', { name: /Save & Run/ }))

    expect(runInCloudDialog.open).toBe(false)
    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Save & Run/ })).toHaveProperty(
      'disabled',
      false
    )
  })

  it('disables Save & Run when the script is invalid', () => {
    renderStep({ script: { valid: false, error: new Error('broken') } })

    expect(screen.getByRole('button', { name: /Save & Run/ })).toHaveProperty(
      'disabled',
      true
    )
  })

  it('updates the load headline when load options change', async () => {
    renderStep()

    useGeneratorStore.setState({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 100,
    })

    await waitFor(() =>
      expect(
        screen.getByText('100 iterations shared across 5 virtual users')
      ).toBeDefined()
    )
  })
})
