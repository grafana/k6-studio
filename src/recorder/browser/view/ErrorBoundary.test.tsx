import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('Function.prototype.bind is not a function')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs every error it catches at error level, which would bury the
    // rest of the test output.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary name="Toolbox">
        <div>toolbox</div>
      </ErrorBoundary>
    )

    expect(screen.queryByText('toolbox')).not.toBeNull()
  })

  it('renders nothing when a child throws while rendering', () => {
    const { container } = render(
      <ErrorBoundary name="Toolbox">
        <Bomb />
      </ErrorBoundary>
    )

    expect(container.innerHTML).toBe('')
  })

  it('keeps sibling features mounted when one of them crashes', () => {
    render(
      <>
        <ErrorBoundary name="Toolbox">
          <Bomb />
        </ErrorBoundary>
        <ErrorBoundary name="Event drawer">
          <div>event drawer</div>
        </ErrorBoundary>
      </>
    )

    expect(screen.queryByText('event drawer')).not.toBeNull()
  })

  it('warns once with the name of the crashed feature and the error', () => {
    render(
      <ErrorBoundary name="Toolbox">
        <Bomb />
      </ErrorBoundary>
    )

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Toolbox'),
      expect.any(Error)
    )
  })

  it('warns without a name when none was given', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
