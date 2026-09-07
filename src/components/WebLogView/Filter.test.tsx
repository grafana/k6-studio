import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Filter } from './Filter'

function renderFilter(filterAllData: boolean, setFilterAllData = vi.fn()) {
  render(
    <Theme>
      <Filter
        filter=""
        setFilter={vi.fn()}
        filterAllData={filterAllData}
        setFilterAllData={setFilterAllData}
      />
    </Theme>
  )
}

describe('Filter', () => {
  it('describes enabling full request-data search', () => {
    renderFilter(false)

    expect(
      screen.getByRole('button', {
        name: 'Include headers, cookies, payload, and response data in search',
      })
    ).toBeTruthy()
  })

  it('describes returning to request-summary search', async () => {
    const setFilterAllData = vi.fn()
    renderFilter(true, setFilterAllData)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Search URL, method, and status code only',
      })
    )

    expect(setFilterAllData).toHaveBeenCalledWith(false)
  })
})
