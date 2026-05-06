import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LoadProfile } from './LoadProfile'

describe('LoadProfile (controlled)', () => {
  it('shows only the executors passed via prop', () => {
    render(
      <Theme>
        <LoadProfile
          value={{ executor: 'shared-iterations', vus: 1, iterations: 1 }}
          onChange={vi.fn()}
          executors={['shared-iterations']}
        />
      </Theme>
    )
    expect(screen.getByLabelText(/Shared iterations/i)).toBeDefined()
    expect(screen.queryByLabelText(/Ramping VUs/i)).toBeNull()
  })

  it('shows both executors when both are provided', () => {
    render(
      <Theme>
        <LoadProfile
          value={{ executor: 'shared-iterations', vus: 1, iterations: 1 }}
          onChange={vi.fn()}
          executors={['ramping-vus', 'shared-iterations']}
        />
      </Theme>
    )
    expect(screen.getByLabelText(/Shared iterations/i)).toBeDefined()
    expect(screen.getByLabelText(/Ramping VUs/i)).toBeDefined()
  })
})
