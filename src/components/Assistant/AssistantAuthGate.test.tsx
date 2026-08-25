import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssistantAuthStatus } from '@/handlers/ai/a2a/assistantAuth'

import { AssistantAuthGate } from './AssistantAuthGate'

const { useAssistantAuthStatusMock, signInMock } = vi.hoisted(() => ({
  useAssistantAuthStatusMock:
    vi.fn<
      () => { data: AssistantAuthStatus | undefined; isLoading: boolean }
    >(),
  signInMock: vi.fn(),
}))

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantAuthStatus: () => useAssistantAuthStatusMock(),
  useAssistantSignIn: () => ({
    isPending: false,
    mutate: signInMock,
    cancel: vi.fn(),
    error: null,
    verificationCode: null,
  }),
  invalidateAssistantAuthStatus: vi.fn(),
}))

vi.mock('@/hooks/useStackHealth', () => ({
  useStackHealth: () => ({ isStackReady: true }),
}))

const trackEvent = vi.fn()
const openExternalLink = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()

  useAssistantAuthStatusMock.mockReturnValue({
    data: undefined,
    isLoading: false,
  })

  vi.stubGlobal('studio', {
    app: { trackEvent },
    browser: { openExternalLink },
  })
})

function renderGate() {
  return render(
    <Theme>
      <AssistantAuthGate>
        <div data-testid="wizard-content" />
      </AssistantAuthGate>
    </Theme>
  )
}

describe('AssistantAuthGate (signed out)', () => {
  it('links to the sign-up page with attribution params', () => {
    renderGate()

    const link = screen.getByRole('link', { name: 'Create a free account' })

    expect(link).toHaveProperty(
      'href',
      'https://grafana.com/auth/sign-up/create-user?pg=k6-studio&plcmt=test-config-wizard'
    )
  })

  it('tracks a usage event when the sign-up link is clicked', async () => {
    renderGate()

    await userEvent.click(
      screen.getByRole('link', { name: 'Create a free account' })
    )

    expect(trackEvent).toHaveBeenCalledWith({
      event: 'test_setup_wizard_sign_up_clicked',
    })
  })
})

describe('AssistantAuthGate (expired session)', () => {
  beforeEach(() => {
    useAssistantAuthStatusMock.mockReturnValue({
      data: { connection: 'expired', stackId: '1', stackName: 'my-stack' },
      isLoading: false,
    })
  })

  it('asks the user to reconnect instead of gating on a first connection', () => {
    renderGate()

    expect(screen.getByText('Your session has expired')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeDefined()
    expect(screen.queryByTestId('wizard-content')).toBeNull()
  })

  it('reconnects through the same sign-in flow', async () => {
    renderGate()

    await userEvent.click(screen.getByRole('button', { name: 'Reconnect' }))

    expect(signInMock).toHaveBeenCalledOnce()
  })
})
