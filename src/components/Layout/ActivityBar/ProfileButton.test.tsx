import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AuthStatus } from '@/handlers/auth/types'

import { ProfileButton } from './ProfileButton'

function renderWithTheme(status: AuthStatus) {
  return render(
    <Theme>
      <ProfileButton status={status} onClick={vi.fn()} />
    </Theme>
  )
}

const sampleStack = {
  id: 's1',
  url: 'https://s1.example.com',
  name: 'Production',
  user: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    username: 'ada',
  },
}

describe('ProfileButton', () => {
  it('renders the signed-out variant with a Sign in label', () => {
    renderWithTheme({ type: 'signed-out' })
    expect(
      screen.getByRole('button', { name: /sign in to grafana cloud/i })
    ).toBeTruthy()
  })

  it('renders initials when signed-in', () => {
    renderWithTheme({ type: 'signed-in', stack: sampleStack })
    expect(screen.getByText('AL')).toBeTruthy()
  })

  it('uses username in the tooltip when name is null', () => {
    renderWithTheme({
      type: 'signed-in',
      stack: {
        ...sampleStack,
        user: { name: null, email: 'ada@example.com', username: 'ada' },
      },
    })
    expect(
      screen.getByRole('button', { name: /ada \(production\)/i })
    ).toBeTruthy()
  })

  it('uses username in the tooltip when name is an empty string', () => {
    renderWithTheme({
      type: 'signed-in',
      stack: {
        ...sampleStack,
        user: { name: '', email: 'ada@example.com', username: 'ada' },
      },
    })
    expect(
      screen.getByRole('button', { name: /ada \(production\)/i })
    ).toBeTruthy()
  })

  it('uses email in the tooltip when name and username are both empty', () => {
    renderWithTheme({
      type: 'signed-in',
      stack: {
        ...sampleStack,
        user: { name: '', email: 'ada@example.com', username: '' },
      },
    })
    expect(
      screen.getByRole('button', { name: /ada@example\.com \(production\)/i })
    ).toBeTruthy()
  })
})
