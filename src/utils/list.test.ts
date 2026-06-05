import { describe, expect, it } from 'vitest'

import { emptyToUndefined } from './list'

describe('emptyToUndefined', () => {
  it('returns undefined for an empty array', () => {
    expect(emptyToUndefined([])).toBeUndefined()
  })

  it('returns the array unchanged when it has items', () => {
    const items = [1, 2, 3]

    expect(emptyToUndefined(items)).toBe(items)
  })
})
