import { describe, it, expect } from 'vitest'

import { getDisplayName } from './displayName'

describe('getDisplayName', () => {
  it('prefers name when non-empty', () => {
    expect(
      getDisplayName({
        name: 'Ada Lovelace',
        username: 'ada',
        email: 'ada@example.com',
      })
    ).toBe('Ada Lovelace')
  })

  it('falls back to username when name is null', () => {
    expect(
      getDisplayName({ name: null, username: 'ada', email: 'ada@example.com' })
    ).toBe('ada')
  })

  it('falls back to username when name is whitespace', () => {
    expect(
      getDisplayName({
        name: '   ',
        username: 'ada',
        email: 'ada@example.com',
      })
    ).toBe('ada')
  })

  it('falls back to email when both name and username are empty', () => {
    expect(
      getDisplayName({ name: '', username: '', email: 'ada@example.com' })
    ).toBe('ada@example.com')
  })

  it('trims surrounding whitespace from name', () => {
    expect(
      getDisplayName({
        name: '  Ada Lovelace  ',
        username: 'ada',
        email: 'ada@example.com',
      })
    ).toBe('Ada Lovelace')
  })
})
