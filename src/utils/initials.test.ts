import { describe, it, expect } from 'vitest'

import { getInitials } from './initials'

describe('getInitials', () => {
  it('uses first and last name initials when name has two words', () => {
    expect(
      getInitials({
        name: 'Ada Lovelace',
        username: 'ada',
        email: 'ada@example.com',
      })
    ).toBe('AL')
  })

  it('uses first and last when name has more than two whitespace-separated parts', () => {
    expect(
      getInitials({
        name: '  Anna  Maria  Smith ',
        username: 'a',
        email: 'a@example.com',
      })
    ).toBe('AS')
  })

  it('uses first and last when each name part is two characters', () => {
    expect(
      getInitials({ name: 'Al Lo', username: 'allo', email: 'al@example.com' })
    ).toBe('AL')
  })

  it('uses a single letter when name is a single word', () => {
    expect(
      getInitials({
        name: 'madonna',
        username: 'madonna',
        email: 'm@example.com',
      })
    ).toBe('M')
  })

  it('falls back to username initial when name is null', () => {
    expect(
      getInitials({ name: null, username: 'jdoe', email: 'jdoe@example.com' })
    ).toBe('J')
  })

  it('falls back to username initial when name is empty', () => {
    expect(
      getInitials({ name: '', username: 'jdoe', email: 'jdoe@example.com' })
    ).toBe('J')
  })

  it('falls back to email local-part initial when both name and username are missing', () => {
    expect(
      getInitials({ name: null, username: null, email: 'jane@example.com' })
    ).toBe('J')
  })

  it('returns a question mark when name, username, and email are all empty', () => {
    expect(getInitials({ name: null, username: null, email: '' })).toBe('?')
  })
})
