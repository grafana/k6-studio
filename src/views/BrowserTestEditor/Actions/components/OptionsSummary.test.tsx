import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { OptionsSummary } from './OptionsSummary'

function renderWithTheme(ui: ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

describe('OptionsSummary', () => {
  it('renders all option entries by default', () => {
    renderWithTheme(
      <OptionsSummary options={{ button: 'right', timeout: 1000 }} />
    )

    expect(screen.getByText(/button=right/)).toBeDefined()
    expect(screen.getByText(/timeout=1000ms/)).toBeDefined()
  })

  it('hides keys listed in excludeKeys but keeps the rest', () => {
    renderWithTheme(
      <OptionsSummary
        options={{ button: 'right', timeout: 1000 }}
        excludeKeys={['button']}
      />
    )

    expect(screen.queryByText(/button=/)).toBeNull()
    expect(screen.getByText(/timeout=1000ms/)).toBeDefined()
  })

  it('renders nothing when every remaining entry is excluded', () => {
    const { container } = renderWithTheme(
      <OptionsSummary options={{ button: 'middle' }} excludeKeys={['button']} />
    )

    expect(container.textContent).toBe('')
  })
})
