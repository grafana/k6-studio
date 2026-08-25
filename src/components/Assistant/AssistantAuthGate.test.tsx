import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssistantAuthStatus } from '@/handlers/ai/a2a/assistantAuth'
import type { useStackHealth } from '@/hooks/useStackHealth'

import { AssistantAuthGate } from './AssistantAuthGate'

type AuthStatusQuery = {
  data: AssistantAuthStatus | undefined
  isLoading: boolean
}

const { useAssistantAuthStatusMock, useStackHealthMock } = vi.hoisted(() => ({
  useAssistantAuthStatusMock: vi.fn<() => AuthStatusQuery>(),
  useStackHealthMock: vi.fn<() => ReturnType<typeof useStackHealth>>(),
}))

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantAuthStatus: () => useAssistantAuthStatusMock(),
  useAssistantSignIn: () => ({
    isPending: false,
    mutate: vi.fn(),
    cancel: vi.fn(),
    error: null,
    verificationCode: null,
  }),
  invalidateAssistantAuthStatus: vi.fn(),
}))

vi.mock('@/hooks/useStackHealth', () => ({
  useStackHealth: () => useStackHealthMock(),
}))

const trackEvent = vi.fn()
const openExternalLink = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()

  useAssistantAuthStatusMock.mockReturnValue({
    data: undefined,
    isLoading: false,
  })
  useStackHealthMock.mockReturnValue({ isStackReady: true, captchaUrl: null })

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

describe('AssistantAuthGate (hibernating stack)', () => {
  beforeEach(() => {
    useAssistantAuthStatusMock.mockReturnValue({
      data: { authenticated: true, stackId: '1', stackName: 'my-stack' },
      isLoading: false,
    })
  })

  it('asks the user to open their instance when it waits for a captcha', () => {
    useStackHealthMock.mockReturnValue({
      isStackReady: false,
      captchaUrl: 'https://mystack.grafana.net',
    })

    renderGate()

    expect(
      screen.getByRole('button', { name: 'Open my instance' })
    ).toBeDefined()
    expect(screen.queryByText('Your Grafana instance is loading...')).toBeNull()
  })

  it('keeps showing the spinner while the instance boots on its own', () => {
    useStackHealthMock.mockReturnValue({
      isStackReady: false,
      captchaUrl: null,
    })

    renderGate()

    expect(
      screen.getByText('Your Grafana instance is loading...')
    ).toBeDefined()
    expect(
      screen.queryByRole('button', { name: 'Open my instance' })
    ).toBeNull()
  })

  it('renders its children once the stack is ready', () => {
    renderGate()

    expect(screen.getByTestId('wizard-content')).toBeDefined()
  })
})
