import { cleanup, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CONNECT_COPY } from '@/components/Assistant/connectCopy'

import { ErrorMessage } from './ErrorMessage'

const { endRejectedSessionMock } = vi.hoisted(() => ({
  endRejectedSessionMock: vi.fn(),
}))

vi.mock('@/hooks/useAssistantAuth', () => ({
  endRejectedAssistantSession: endRejectedSessionMock,
}))

vi.mock('@/assets/grot-crashed.svg', () => ({
  default: 'grot-crashed.svg',
}))

const baseProps = {
  onRetry: vi.fn(),
  onReset: vi.fn(),
  onClose: vi.fn(),
}

afterEach(cleanup)

describe('ErrorMessage', () => {
  it('renders the shared expired-session prompt for HTTP 401 error text', () => {
    render(
      <ErrorMessage
        {...baseProps}
        error={new Error('A2A request failed (401): Unauthorized')}
      />
    )
    // Same wording the assistant auth gate and the wizard show.
    expect(screen.getByText(CONNECT_COPY.expired.title)).toBeDefined()
    expect(screen.getByText(CONNECT_COPY.expired.description)).toBeDefined()
    expect(
      screen.getByRole('button', { name: CONNECT_COPY.expired.action })
    ).toBeDefined()
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

  it('renders "Recording too large" for context exceeded error', () => {
    render(
      <ErrorMessage
        {...baseProps}
        error={new Error('prompt is too long: 213329 tokens > 200000 maximum')}
      />
    )
    expect(screen.getByText('Recording too large')).toBeDefined()
    expect(screen.getByRole('button', { name: /Close/ })).toBeDefined()
  })

  it('renders "Something went wrong" for unknown error', () => {
    render(
      <ErrorMessage {...baseProps} error={new Error('Something unexpected')} />
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByRole('button', { name: /Retry/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Report issue/ })).toBeDefined()
  })

  it('ends the session when reconnecting, so the status stops reading as live', async () => {
    // An A2A 401 leaves the stored expiry untouched, so invalidating alone
    // would report the session as connected and land back on Analyze.
    render(
      <ErrorMessage
        {...baseProps}
        error={new Error('A2A request failed (401): Unauthorized')}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: CONNECT_COPY.expired.action })
    )

    expect(endRejectedSessionMock).toHaveBeenCalledOnce()
  })
})
