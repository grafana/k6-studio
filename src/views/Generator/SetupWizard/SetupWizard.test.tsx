import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'

import { SetupWizard } from './SetupWizard'

vi.mock('@/components/Assistant/AssistantAuthGate', () => ({
  AssistantAuthGate: ({ children }: { children: React.ReactNode }) => children,
}))
// Monaco does not load in jsdom.
vi.mock('@/components/Monaco/ReadOnlyEditor', () => ({
  ReadOnlyEditor: () => null,
}))

describe('SetupWizard', () => {
  const trackEvent = vi.fn()
  const onExit = vi.fn()

  const defaultProps = {
    isLoading: false,
    startInGuidedSetup: false,
    script: { valid: true, preview: 'export default function () {}' } as const,
    scriptName: 'test.k6g',
    onSaveGenerator: vi.fn(),
    onExit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('studio', { app: { trackEvent } })
    useGeneratorStore.setState({ recordingPath: '/recordings/test.har' })
  })

  it('tracks when the wizard is opened', () => {
    render(<SetupWizard {...defaultProps} />)

    expect(trackEvent).toHaveBeenCalledWith({
      event: UsageEventName.TestSetupWizardOpened,
    })
  })

  it('tracks dismissal and exits with the manual outcome', async () => {
    render(<SetupWizard {...defaultProps} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Open generator/ })
    )

    expect(trackEvent).toHaveBeenCalledWith({
      event: UsageEventName.TestSetupWizardDismissed,
    })
    expect(onExit).toHaveBeenCalledWith('manual')
  })

  it('titles a fresh run "New HTTP test"', () => {
    render(<SetupWizard {...defaultProps} />)

    expect(screen.getByText('New HTTP test')).toBeDefined()
  })

  it('titles a generator relaunch "Configure HTTP test"', () => {
    render(<SetupWizard {...defaultProps} startInGuidedSetup />)

    expect(screen.getByText('Configure HTTP test')).toBeDefined()
  })

  it('exits to the generator when cancelled', async () => {
    render(<SetupWizard {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onExit).toHaveBeenCalledWith('manual')
  })

  it('enters the wizard from the choice screen', async () => {
    render(<SetupWizard {...defaultProps} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Start guided setup/ })
    )

    expect(screen.getByText('Step 1 of 5')).toBeDefined()
  })
})
