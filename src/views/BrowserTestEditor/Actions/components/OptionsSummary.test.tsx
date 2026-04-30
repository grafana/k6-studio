import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { OptionsSummary } from './OptionsSummary'

function renderWithTheme(ui: ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

describe('OptionsSummary', () => {
  it('renders nothing when options is undefined', () => {
    const { container } = renderWithTheme(
      <OptionsSummary options={undefined} />
    )
    expect(container.textContent).toBe('')
  })

  it('renders nothing when all values are empty', () => {
    const { container } = renderWithTheme(
      <OptionsSummary options={{ timeout: undefined, state: '' }} />
    )
    expect(container.textContent).toBe('')
  })

  it('renders all option entries by default', () => {
    renderWithTheme(
      <OptionsSummary options={{ button: 'right', timeout: 1000 }} />
    )

    expect(screen.getByText(/button=right/)).toBeDefined()
    expect(screen.getByText(/timeout=1000ms/)).toBeDefined()
  })

  it('renders WaitFor-style options without changes', () => {
    renderWithTheme(
      <OptionsSummary options={{ state: 'visible', timeout: 5000 }} />
    )
    expect(screen.getByText('state=visible')).toBeDefined()
    expect(screen.getByText('timeout=5000ms')).toBeDefined()
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

  it('renders boolean toggle as friendly label without =true', () => {
    renderWithTheme(<OptionsSummary options={{ waitForNavigation: true }} />)
    expect(screen.getByText('wait for navigation')).toBeDefined()
    expect(screen.queryByText(/=true/)).toBeNull()
  })

  it('hides labelled boolean when set to false', () => {
    const { container } = renderWithTheme(
      <OptionsSummary options={{ waitForNavigation: false }} />
    )
    expect(container.textContent).toBe('')
  })

  it('renders unmapped boolean as key=value', () => {
    renderWithTheme(<OptionsSummary options={{ force: false }} />)
    expect(screen.getByText('force=false')).toBeDefined()
  })
})
