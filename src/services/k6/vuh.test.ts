import { describe, expect, it } from 'vitest'

import { parseProjectLimitError } from './vuh'

describe('parseProjectLimitError', () => {
  it('returns the message for a validation error', () => {
    const message =
      'The Virtual User (VU) count for this test (330 VUs) exceeds the maximum allowed for your project (100 VUs).'

    expect(
      parseProjectLimitError({ error: { message, code: 'validation_error' } })
    ).toBe(message)
  })

  it('returns null for other error codes', () => {
    expect(
      parseProjectLimitError({
        error: { message: 'Server exploded', code: 'internal_error' },
      })
    ).toBeNull()
  })

  it('returns null for an unrecognized body', () => {
    expect(parseProjectLimitError({ detail: 'nope' })).toBeNull()
    expect(parseProjectLimitError(null)).toBeNull()
  })
})
