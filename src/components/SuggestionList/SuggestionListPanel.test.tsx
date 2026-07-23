import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SuggestionListPanel } from './SuggestionListPanel'

describe('SuggestionListPanel', () => {
  it('wraps its rows in the bordered panel', () => {
    render(
      <SuggestionListPanel>
        <div>row</div>
      </SuggestionListPanel>
    )

    expect(screen.getByText('row')).toBeDefined()
  })

  it('renders nothing when the list is empty', () => {
    // An empty bordered Box collapses into a stray horizontal line, e.g. on
    // the completed autocorrelation step when no rules were needed.
    const { container } = render(
      <SuggestionListPanel>{[].map(() => null)}</SuggestionListPanel>
    )

    expect(container.firstChild).toBeNull()
  })
})
