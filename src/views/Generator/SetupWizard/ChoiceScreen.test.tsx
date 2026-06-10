import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useAssistantAuthStatus,
  useAssistantSignIn,
} from '@/hooks/useAssistantAuth'
import { useStackHealth } from '@/hooks/useStackHealth'

import { ChoiceScreen } from './ChoiceScreen'

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantAuthStatus: vi.fn(),
  useAssistantSignIn: vi.fn(),
  invalidateAssistantAuthStatus: vi.fn(),
}))
vi.mock('@/hooks/useStackHealth', () => ({ useStackHealth: vi.fn() }))

function mockAuthReady() {
  vi.mocked(useAssistantAuthStatus).mockReturnValue({
    data: { stackId: 'stack-1', authenticated: true },
    isLoading: false,
  } as unknown as ReturnType<typeof useAssistantAuthStatus>)
  vi.mocked(useAssistantSignIn).mockReturnValue({
    isPending: false,
    error: null,
    verificationCode: null,
    mutate: vi.fn(),
    cancel: vi.fn(),
  } as unknown as ReturnType<typeof useAssistantSignIn>)
  vi.mocked(useStackHealth).mockReturnValue({
    isStackReady: true,
  } as unknown as ReturnType<typeof useStackHealth>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuthReady()
})

describe('ChoiceScreen', () => {
  it('renders both configuration options', () => {
    render(
      <ChoiceScreen
        onStartGuidedSetup={vi.fn()}
        onConfigureManually={vi.fn()}
      />
    )

    expect(screen.getByText('Configure with Assistant')).toBeDefined()
    expect(screen.getByText('Configure manually')).toBeDefined()
    expect(screen.getByText('Recommended')).toBeDefined()
  })

  it('starts guided setup', async () => {
    const onStartGuidedSetup = vi.fn()
    render(
      <ChoiceScreen
        onStartGuidedSetup={onStartGuidedSetup}
        onConfigureManually={vi.fn()}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Start guided setup/ })
    )

    expect(onStartGuidedSetup).toHaveBeenCalledOnce()
  })

  it('opens the generator for manual configuration', async () => {
    const onConfigureManually = vi.fn()
    render(
      <ChoiceScreen
        onStartGuidedSetup={vi.fn()}
        onConfigureManually={onConfigureManually}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Open generator/ })
    )

    expect(onConfigureManually).toHaveBeenCalledOnce()
  })

  it('asks the user to sign in before starting guided setup', () => {
    vi.mocked(useAssistantAuthStatus).mockReturnValue({
      data: { stackId: undefined, authenticated: false },
      isLoading: false,
    } as unknown as ReturnType<typeof useAssistantAuthStatus>)

    render(
      <ChoiceScreen
        onStartGuidedSetup={vi.fn()}
        onConfigureManually={vi.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: /Sign in to Grafana Cloud/ })
    ).toBeDefined()
    expect(
      screen.queryByRole('button', { name: /Start guided setup/ })
    ).toBeNull()
  })
})
