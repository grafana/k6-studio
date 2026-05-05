import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ErrorMessage } from './ErrorMessage'

vi.mock('@/hooks/useAssistantAuth', () => ({
  useAssistantSignOut: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/assets/grot-crashed.svg', () => ({
  default: 'grot-crashed.svg',
}))

const baseProps = {
  onRetry: vi.fn(),
  onReset: vi.fn(),
}

afterEach(cleanup)

describe('ErrorMessage', () => {
  it('renders "Session expired" for HTTP 401 error text', () => {
    render(
      <ErrorMessage
        {...baseProps}
        error={new Error('A2A request failed (401): Unauthorized')}
      />
    )
    expect(screen.getByText('Session expired')).toBeDefined()
    expect(screen.getByText(/Reconnect/)).toBeDefined()
  })

  it('renders "Connection error" for fetch failure', () => {
    render(<ErrorMessage {...baseProps} error={new Error('Failed to fetch')} />)
    expect(screen.getByText('Connection error')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
  })

  it('renders "Usage limit reached" for quota error text', () => {
    render(
      <ErrorMessage
        {...baseProps}
        error={
          new Error('Monthly prompt limit of 10 reached for your account.')
        }
      />
    )
    expect(screen.getByText('Usage limit reached')).toBeDefined()
  })

  it('renders "Something went wrong" for unknown error', () => {
    render(
      <ErrorMessage {...baseProps} error={new Error('Something unexpected')} />
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Report issue/ })).toBeDefined()
  })
})
