import { afterEach, describe, expect, it } from 'vitest'

import { formatLocalDate } from './date'

const originalTimeZone = process.env.TZ

afterEach(() => {
  if (originalTimeZone === undefined) {
    delete process.env.TZ
  } else {
    process.env.TZ = originalTimeZone
  }
})

describe('formatLocalDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    process.env.TZ = 'UTC'

    expect(formatLocalDate(new Date('2026-06-05T12:00:00Z'))).toBe('2026-06-05')
  })

  it('uses local time, not UTC, when the instant falls on a different UTC day', () => {
    // 01:30 UTC on June 5 is still June 4 in America/New_York (UTC-4 in June).
    process.env.TZ = 'America/New_York'

    expect(formatLocalDate(new Date('2026-06-05T01:30:00Z'))).toBe('2026-06-04')
  })

  it('zero-pads single-digit months and days', () => {
    process.env.TZ = 'UTC'

    expect(formatLocalDate(new Date('2026-01-09T10:00:00Z'))).toBe('2026-01-09')
  })
})
