import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'

import { CreateNewPopover } from './CreateNewPopover'

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))
vi.mock('@/hooks/useCreateGenerator', () => ({ useCreateGenerator: vi.fn() }))
vi.mock('@/hooks/useCreateBrowserTest', () => ({
  useCreateBrowserTest: vi.fn(),
}))

function renderWithTheme(ui: ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const trigger = document.querySelector('[aria-haspopup="menu"]')
  if (!(trigger instanceof HTMLElement)) throw new Error('Trigger not found')
  await user.click(trigger)
}

describe('CreateNewPopover', () => {
  const navigate = vi.fn()
  const createGenerator = vi.fn()
  const createBrowserTest = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useCreateGenerator).mockReturnValue(createGenerator)
    vi.mocked(useCreateBrowserTest).mockReturnValue(createBrowserTest)
  })

  it('shows Browser test entry', async () => {
    const user = userEvent.setup()
    renderWithTheme(<CreateNewPopover />)

    await openMenu(user)

    expect(screen.getByRole('menuitem', { name: /browser test/i })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /http test/i })).toBeTruthy()
  })

  it('navigates to recorder when Recording is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<CreateNewPopover />)

    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: /recording/i }))

    expect(navigate).toHaveBeenCalledWith('/recorder')
  })

  it('calls useCreateGenerator when HTTP test is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<CreateNewPopover />)

    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: /http test/i }))

    expect(createGenerator).toHaveBeenCalled()
    expect(createBrowserTest).not.toHaveBeenCalled()
  })

  it('calls useCreateBrowserTest when Browser test is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<CreateNewPopover />)

    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: /browser test/i }))

    expect(createBrowserTest).toHaveBeenCalled()
    expect(createGenerator).not.toHaveBeenCalled()
  })
})
