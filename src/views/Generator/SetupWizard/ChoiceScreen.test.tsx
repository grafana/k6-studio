import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ChoiceScreen } from './ChoiceScreen'

describe('ChoiceScreen', () => {
  it('renders both configuration options', () => {
    render(
      <ChoiceScreen
        onStartGuidedSetup={vi.fn()}
        onConfigureManually={vi.fn()}
      />
    )

    expect(screen.getByText('Configure with Assistant')).toBeDefined()
    expect(screen.getByText('Configure manually')).toBeDefined()
    expect(screen.getByText('Recommended')).toBeDefined()
  })

  it('starts guided setup', async () => {
    const onStartGuidedSetup = vi.fn()
    render(
      <ChoiceScreen
        onStartGuidedSetup={onStartGuidedSetup}
        onConfigureManually={vi.fn()}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Start guided setup/ })
    )

    expect(onStartGuidedSetup).toHaveBeenCalledOnce()
  })

  it('opens the generator for manual configuration', async () => {
    const onConfigureManually = vi.fn()
    render(
      <ChoiceScreen
        onStartGuidedSetup={vi.fn()}
        onConfigureManually={onConfigureManually}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /Open generator/ }))

    expect(onConfigureManually).toHaveBeenCalledOnce()
  })
})
