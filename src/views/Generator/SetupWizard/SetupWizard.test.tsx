import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'

import { SetupWizard } from './SetupWizard'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('@/components/Assistant/AssistantAuthGate', () => ({
  AssistantAuthGate: ({ children }: { children: React.ReactNode }) => children,
}))
// Monaco cannot load in jsdom; it is pulled in transitively via the
// parameterization step's value editor.
vi.mock('@/components/Monaco/ConstrainedCodeEditor', () => ({
  ConstrainedCodeEditor: () => <div data-testid="code-editor" />,
}))

describe('SetupWizard', () => {
  const trackEvent = vi.fn()
  const onExit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('studio', { app: { trackEvent } })
    useGeneratorStore.setState({ recordingPath: '/recordings/test.har' })
  })

  it('tracks when the wizard is opened', () => {
    render(<SetupWizard isLoading={false} onExit={onExit} />)

    expect(trackEvent).toHaveBeenCalledWith({
      event: UsageEventName.TestSetupWizardOpened,
    })
  })

  it('tracks dismissal and exits with the manual outcome', async () => {
    render(<SetupWizard isLoading={false} onExit={onExit} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Open generator/ })
    )

    expect(trackEvent).toHaveBeenCalledWith({
      event: UsageEventName.TestSetupWizardDismissed,
    })
    expect(onExit).toHaveBeenCalledWith('manual')
  })

  it('enters the wizard from the choice screen', async () => {
    render(<SetupWizard isLoading={false} onExit={onExit} />)

    await userEvent.click(
      screen.getByRole('button', { name: /Start guided setup/ })
    )

    expect(screen.getByText('Step 1 of 4')).toBeDefined()
  })
})
