import { describe, expect, it } from 'vitest'

import { AssistantError, classifyError } from './classifyError'

describe('classifyError', () => {
  describe('config errors', () => {
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
  })

  describe('HTTP status codes', () => {
    it('classifies HTTP 401 as auth-expired', () => {
      const result = classifyError('Unauthorized', { httpStatus: 401 })
      expect(result.category).toBe('auth-expired')
    })

    it('classifies HTTP 500 as unknown', () => {
      const result = classifyError('Internal server error', { httpStatus: 500 })
      expect(result.category).toBe('unknown')
    })
  })

  describe('permission errors', () => {
    it('classifies HTTP 403 as auth-expired', () => {
      const result = classifyError('Forbidden', { httpStatus: 403 })
      expect(result.category).toBe('auth-expired')
    })
  })

  describe('network errors', () => {
    it('classifies TypeError as network error', () => {
      const result = classifyError('Failed to fetch', {
        isTypeError: true,
      })
      expect(result.category).toBe('network')
    })

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

describe('AssistantError', () => {
  it('is an instance of Error', () => {
    const error = new AssistantError('test', {
      category: 'unknown',
      message: 'test',
    })
    expect(error).toBeInstanceOf(Error)
  })

  it('carries errorInfo', () => {
    const errorInfo = { category: 'auth-expired' as const, message: 'expired' }
    const error = new AssistantError('expired', errorInfo)
    expect(error.errorInfo).toEqual(errorInfo)
    expect(error.message).toBe('expired')
  })
})
