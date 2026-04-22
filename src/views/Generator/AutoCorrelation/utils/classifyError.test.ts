import { describe, expect, it } from 'vitest'

import { classifyError } from './classifyError'

describe('classifyError', () => {
  describe('auth errors', () => {
    it('classifies "Not authenticated" as auth-expired', () => {
      const result = classifyError(
        'Not authenticated with Grafana Assistant. Please connect to Grafana Assistant first.'
      )
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "refresh token has expired" as auth-expired', () => {
      const result = classifyError(
        'Assistant refresh token has expired. Please re-authenticate with Grafana Assistant.'
      )
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "token refresh failed" as auth-expired', () => {
      const result = classifyError(
        'Assistant token refresh failed (401): Unauthorized'
      )
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "A2A request failed (401)" as auth-expired', () => {
      const result = classifyError('A2A request failed (401): Unauthorized')
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "A2A request failed (403)" as auth-expired', () => {
      const result = classifyError('A2A request failed (403): Forbidden')
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "A2A request failed (500)" as unknown', () => {
      const result = classifyError(
        'A2A request failed (500): Internal server error'
      )
      expect(result.category).toBe('unknown')
    })
  })

  describe('quota errors', () => {
    it('classifies "limit reached" as quota-exceeded', () => {
      const result = classifyError(
        'Monthly prompt limit of 10 reached for your account.'
      )
      expect(result.category).toBe('quota-exceeded')
    })

    it('classifies "quota exceeded" as quota-exceeded', () => {
      const result = classifyError('Anthropic quota exceeded')
      expect(result.category).toBe('quota-exceeded')
    })
  })

  describe('network errors', () => {
    it('classifies "Failed to fetch" message as network error', () => {
      const result = classifyError('Failed to fetch')
      expect(result.category).toBe('network')
    })

    it('classifies "fetch failed" message as network error', () => {
      const result = classifyError('fetch failed')
      expect(result.category).toBe('network')
    })
  })

  describe('generic errors', () => {
    it('classifies unknown error as unknown', () => {
      const result = classifyError('Something unexpected happened')
      expect(result.category).toBe('unknown')
    })

    it('includes original message in result', () => {
      const result = classifyError('Something unexpected happened')
      expect(result.message).toBe('Something unexpected happened')
    })
  })
})
