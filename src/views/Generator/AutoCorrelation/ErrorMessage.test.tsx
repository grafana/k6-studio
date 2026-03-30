import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  AssistantErrorCategory,
  AssistantErrorInfo,
} from '@/types/assistant'

import { ErrorMessage } from './ErrorMessage'

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantSignOut: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/hooks/useSettings', () => ({
  useSettingsChanged: vi.fn(),
}))

vi.mock('@/store/features', () => ({
  useFeaturesStore: (
    selector: (state: { features: Record<string, boolean> }) => boolean
  ) => selector({ features: { 'grafana-assistant': true } }),
}))

vi.mock('@/store/ui', () => ({
  useStudioUIStore: () => vi.fn(),
}))

vi.mock('@/assets/grot-crashed.svg', () => ({
  default: 'grot-crashed.svg',
}))

function makeErrorInfo(
  category: AssistantErrorCategory,
  overrides?: Partial<AssistantErrorInfo>
): AssistantErrorInfo {
  return {
    category,
    message: 'test error',
    ...overrides,
  }
}

const defaultProps = {
  error: new Error('test error'),
  onRetry: vi.fn(),
  onReset: vi.fn(),
}

afterEach(cleanup)

describe('ErrorMessage with assistantErrorInfo', () => {
  it('renders "Session expired" for auth-expired', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('auth-expired')}
      />
    )
    expect(screen.getByText('Session expired')).toBeDefined()
    expect(screen.getByText(/Reconnect/)).toBeDefined()
  })

  it('renders "Not signed in" for no-stack', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('no-stack')}
      />
    )
    expect(screen.getByText('Not signed in')).toBeDefined()
    expect(
      screen.getByRole('button', { name: /Sign in to Grafana Cloud/ })
    ).toBeDefined()
  })

  it('renders "Too many requests" for rate-limit', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('rate-limit')}
      />
    )
    expect(screen.getByText('Too many requests')).toBeDefined()
    expect(screen.getByText(/Retry/)).toBeDefined()
  })

  it('renders "Usage limit reached" for quota-exceeded', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('quota-exceeded', {
          upgradeUrl: 'https://grafana.com/orgs/test/my-account/manage-plan',
        })}
      />
    )
    expect(screen.getByText('Usage limit reached')).toBeDefined()
    expect(screen.getByText(/Upgrade plan/)).toBeDefined()
  })

  it('renders "Recording too large" for context-window', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('context-window')}
      />
    )
    expect(screen.getByText('Recording too large')).toBeDefined()
  })

  it('renders "Service unavailable" for service-unavailable', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('service-unavailable')}
      />
    )
    expect(screen.getByText('Service unavailable')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
  })

  it('renders "Connection error" for network', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('network')}
      />
    )
    expect(screen.getByText('Connection error')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
  })

  it('renders "Something went wrong" for unknown', () => {
    render(
      <ErrorMessage
        {...defaultProps}
        assistantErrorInfo={makeErrorInfo('unknown')}
      />
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Report issue/ })).toBeDefined()
  })

  it('falls back to string matching when assistantErrorInfo is absent', () => {
    render(<ErrorMessage {...defaultProps} />)
    // Should render the legacy fallback (grafana-assistant path, no assistantErrorInfo)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
