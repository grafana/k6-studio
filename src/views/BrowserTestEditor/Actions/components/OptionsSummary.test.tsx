import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { OptionsSummary } from './OptionsSummary'

afterEach(cleanup)

describe('OptionsSummary', () => {
  it('renders nothing when options is undefined', () => {
    const { container } = render(<OptionsSummary options={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all values are empty', () => {
    const { container } = render(
      <OptionsSummary options={{ timeout: undefined, state: '' }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders WaitFor-style options without changes', () => {
    render(<OptionsSummary options={{ state: 'visible', timeout: 5000 }} />)
    expect(screen.getByText('state=visible')).toBeDefined()
    expect(screen.getByText('timeout=5000ms')).toBeDefined()
  })

  it('renders boolean toggle as friendly label without =true', () => {
    render(<OptionsSummary options={{ waitForNavigation: true }} />)
    expect(screen.getByText('wait for navigation')).toBeDefined()
    expect(screen.queryByText(/=true/)).toBeNull()
  })

  it('hides labelled boolean when set to false', () => {
    const { container } = render(
      <OptionsSummary options={{ waitForNavigation: false }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders unmapped boolean as key=value', () => {
    render(<OptionsSummary options={{ force: false }} />)
    expect(screen.getByText('force=false')).toBeDefined()
  })
})
