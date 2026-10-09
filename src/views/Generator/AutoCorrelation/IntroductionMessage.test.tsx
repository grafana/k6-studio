import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssistantAuthStatus } from '@/handlers/ai/a2a/assistantAuth'

import { IntroductionMessage } from './IntroductionMessage'

const { useAssistantAuthStatusMock } = vi.hoisted(() => ({
  useAssistantAuthStatusMock:
    vi.fn<
      () => { data: AssistantAuthStatus | undefined; isLoading: boolean }
    >(),
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
  useStackHealth: () => ({ isStackReady: true }),
}))

vi.mock('@/hooks/useProxyStatus', () => ({
  useProxyStatus: () => 'online',
}))

const signedInStatus = { stackId: '1', stackName: 'my-stack' }

beforeEach(() => {
  vi.clearAllMocks()
})

function renderIntro(connection: AssistantAuthStatus['connection']) {
  useAssistantAuthStatusMock.mockReturnValue({
    data: { ...signedInStatus, connection },
    isLoading: false,
  })

  return render(
    <Theme>
      <IntroductionMessage onStart={vi.fn()} />
    </Theme>
  )
}

describe('IntroductionMessage', () => {
  it('asks for a reconnect when the session has expired', () => {
    renderIntro('expired')

    // Matches the wording the assistant auth gate shows for the same state.
    expect(screen.getByText(/Your session has expired/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeDefined()
  })

  it('asks for a first connection when never connected', () => {
    renderIntro('disconnected')

    expect(
      screen.getByRole('button', { name: 'Connect to Grafana Assistant' })
    ).toBeDefined()
    expect(screen.queryByText(/Your session has expired/)).toBeNull()
  })

  it('offers the analysis once connected', () => {
    renderIntro('connected')

    expect(
      screen.getByRole('button', { name: 'Analyze recording' })
    ).toBeDefined()
  })
})
