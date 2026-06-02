import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FooterActions } from './FooterActions'

const baseProps = {
  ruleCount: 2,
  onStop: vi.fn(),
  onDiscard: vi.fn(),
  onAccept: vi.fn(),
}

afterEach(cleanup)

describe('FooterActions', () => {
  it('shows the correlating spinner and Stop while loading', () => {
    render(<FooterActions {...baseProps} isLoading />)

    expect(screen.getByText(/Correlating/)).toBeDefined()
    expect(screen.getByRole('button', { name: /Stop/ })).toBeDefined()
    expect(screen.queryByRole('button', { name: /Discard/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Add/ })).toBeNull()
  })

  it('shows Discard and Add actions when not loading', () => {
    render(<FooterActions {...baseProps} isLoading={false} />)

    expect(screen.getByRole('button', { name: /Discard/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /Add 2 rules/ })).toBeDefined()
    expect(screen.queryByText(/Correlating/)).toBeNull()
  })

  it('disables Add when there are no rules', () => {
    render(<FooterActions {...baseProps} isLoading={false} ruleCount={0} />)

    expect(screen.getByRole('button', { name: /Add 0 rules/ })).toHaveProperty(
      'disabled',
      true
    )
  })
})
