import { describe, expect, it } from 'vitest'

import { CountedSet } from './utils'

describe('CountedSet', () => {
  it('deletes values only when the counter reaches zero', () => {
    const set = new CountedSet([['page', 2]])

    expect(set.size).toBe(1)
    expect(set.delete('page')).toBe(true)
    expect(set.size).toBe(1)
    expect(set.delete('page')).toBe(true)
    expect(set.size).toBe(0)
  })

  it('accumulates counts through add()', () => {
    const set = new CountedSet<string>()

    set.add('locator')
    set.add('locator', 2)

    expect(set.size).toBe(1)
    expect(set.delete('locator')).toBe(true)
    expect(set.delete('locator')).toBe(true)
    expect(set.size).toBe(1)
    expect(set.delete('locator')).toBe(true)
    expect(set.size).toBe(0)
  })

  it('returns false when deleting unknown values', () => {
    const set = new CountedSet([['known', 1]])

    expect(set.delete('missing')).toBe(false)
    expect(set.size).toBe(1)
  })
})
