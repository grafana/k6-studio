import { describe, expect, it } from 'vitest'

import { classifyError } from './classifyError'

describe('classifyError', () => {
  describe('auth errors', () => {
    it.each([
      'Not authenticated with Grafana Assistant. Please connect to Grafana Assistant first.',
      'Assistant refresh token has expired. Please re-authenticate with Grafana Assistant.',
      'Assistant token refresh failed (401): Unauthorized',
      'A2A request failed (401): Unauthorized',
      'A2A request failed (403): Forbidden',
    ])('classifies "%s" as auth-expired', (message) => {
      expect(classifyError(message).category).toBe('auth-expired')
    })

    it('classifies "A2A request failed (500)" as unknown', () => {
      const result = classifyError(
        'A2A request failed (500): Internal server error'
      )
      expect(result.category).toBe('unknown')
    })
  })

  describe('quota errors', () => {
    it.each([
      'Monthly prompt limit of 10 reached for your account.',
      'Anthropic quota exceeded',
    ])('classifies "%s" as quota-exceeded', (message) => {
      expect(classifyError(message).category).toBe('quota-exceeded')
    })
  })

  describe('network errors', () => {
    it.each(['Failed to fetch', 'fetch failed'])(
      'classifies "%s" as network',
      (message) => {
        expect(classifyError(message).category).toBe('network')
      }
    )
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
