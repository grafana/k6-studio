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
