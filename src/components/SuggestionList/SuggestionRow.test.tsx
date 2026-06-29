import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { SuggestionRow } from './SuggestionRow'

function renderRow(props: Partial<Parameters<typeof SuggestionRow>[0]> = {}) {
  return render(
    <Theme>
      <SuggestionRow name="csrf_token" {...props} />
    </Theme>
  )
}

describe('SuggestionRow', () => {
  it('renders the name, secondary, and controls', () => {
    renderRow({
      secondary: <span>from response</span>,
      controls: <button>Remove</button>,
    })

    expect(screen.getByText('csrf_token')).toBeDefined()
    expect(screen.getByText('from response')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDefined()
  })

  it('has no expand control without expandable content', () => {
    renderRow()

    expect(screen.queryByText('details')).toBeNull()
  })

  it('toggles expandable content via the row', async () => {
    renderRow({ expandableContent: <span>details</span> })

    // Collapsed by default.
    expect(screen.queryByText('details')).toBeNull()

    await userEvent.click(screen.getByText('csrf_token'))
    expect(screen.getByText('details')).toBeDefined()

    await userEvent.click(screen.getByText('csrf_token'))
    expect(screen.queryByText('details')).toBeNull()
  })

  it('respects defaultExpanded', () => {
    renderRow({
      expandableContent: <span>details</span>,
      defaultExpanded: true,
    })

    expect(screen.getByText('details')).toBeDefined()
  })
})
