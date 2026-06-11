import { describe, it, expect } from 'vitest'

import { shouldSkipHeader } from './skipHeaders'

describe('shouldSkipHeader', () => {
  it('skips standard server-generated headers', () => {
    const skipped = [
      'date',
      'server-timing',
      'alt-svc',
      'vary',
      'via',
      'server',
      'accept-ranges',
      'retry-after',
      'keep-alive',
    ]

    skipped.forEach((name) => expect(shouldSkipHeader(name)).toBe(true))
  })

  it('skips diagnostic id and rate-limit headers by pattern, regardless of vendor prefix', () => {
    const skipped = [
      'grafana-trace-id',
      'x-datadog-trace-id',
      'x-amzn-requestid',
      'my-request-id',
      'x-correlation-id',
      'b3-span-id',
      'audit-id',
      'x-ratelimit-remaining',
      'x-rate-limit-limit',
    ]

    skipped.forEach((name) => expect(shouldSkipHeader(name)).toBe(true))
  })

  it('is case-insensitive', () => {
    expect(shouldSkipHeader('Server-Timing')).toBe(true)
  })

  it('does not skip correlation candidates like Location', () => {
    expect(shouldSkipHeader('location')).toBe(false)
    expect(shouldSkipHeader('x-custom-header')).toBe(false)
  })

  it('defers set-cookie headers to the cookie skip rules', () => {
    expect(shouldSkipHeader('set-cookie.awsalb')).toBe(true)
    expect(shouldSkipHeader('set-cookie.csrf_token')).toBe(false)
  })

  it('defers set-cookie to cookie rules even when the cookie name contains a header pattern', () => {
    // A functional cookie whose name happens to contain a diagnostic-id
    // substring must not be dropped by the header patterns.
    expect(shouldSkipHeader('set-cookie.session-trace-id')).toBe(false)
  })
})
