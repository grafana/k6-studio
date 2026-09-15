import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AssistantAuthGate } from './AssistantAuthGate'

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantAuthStatus: () => ({ data: undefined, isLoading: false }),
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
  useStackHealth: () => ({ isStackReady: true }),
}))

const trackEvent = vi.fn()
const openExternalLink = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()

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
