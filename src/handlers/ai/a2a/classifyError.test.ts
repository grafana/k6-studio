import { describe, expect, it } from 'vitest'

import { isRetryable } from '@/types/assistant'

import { AssistantError, classifyError } from './classifyError'

describe('classifyError', () => {
  describe('config errors', () => {
    it('classifies "No Grafana Cloud stack" as no-stack', () => {
      const result = classifyError(
        'No Grafana Cloud stack selected. Please sign in to Grafana Cloud first.'
      )
      expect(result.category).toBe('no-stack')
    })

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

    it('classifies HTTP 429 with RESOURCE_LIMIT_EXCEEDED as quota-exceeded', () => {
      const result = classifyError(
        'RESOURCE_LIMIT_EXCEEDED: Monthly prompt limit of 2 reached',
        { httpStatus: 429 }
      )
      expect(result.category).toBe('quota-exceeded')
    })

    it('classifies HTTP 429 with quota in message as quota-exceeded', () => {
      const result = classifyError('Quota exceeded for this tenant', {
        httpStatus: 429,
      })
      expect(result.category).toBe('quota-exceeded')
    })

    it('includes upgradeUrl for quota-exceeded when apiEndpoint provided', () => {
      const result = classifyError(
        'RESOURCE_LIMIT_EXCEEDED: Monthly prompt limit reached',
        { httpStatus: 429, apiEndpoint: 'https://my-stack.grafana.net' }
      )
      expect(result.category).toBe('quota-exceeded')
      expect(result.upgradeUrl).toContain('grafana.com')
    })

    it('classifies HTTP 429 without quota indicators as rate-limit', () => {
      const result = classifyError('Too many requests', { httpStatus: 429 })
      expect(result.category).toBe('rate-limit')
    })

    it('classifies HTTP 503 as service-unavailable', () => {
      const result = classifyError('Service unavailable', { httpStatus: 503 })
      expect(result.category).toBe('service-unavailable')
    })

    it('classifies HTTP 500 as unknown', () => {
      const result = classifyError('Internal server error', { httpStatus: 500 })
      expect(result.category).toBe('unknown')
    })
  })

  describe('permission errors', () => {
    it('classifies "Permission check failed" as auth-expired', () => {
      const result = classifyError(
        'A2A request failed (500): Permission check failed'
      )
      expect(result.category).toBe('auth-expired')
    })

    it('classifies "permission denied" as auth-expired', () => {
      const result = classifyError('permission denied')
      expect(result.category).toBe('auth-expired')
    })

    it('classifies HTTP 403 as auth-expired', () => {
      const result = classifyError('Forbidden', { httpStatus: 403 })
      expect(result.category).toBe('auth-expired')
    })
  })

  describe('context window errors', () => {
    it('classifies context window error from message', () => {
      const result = classifyError(
        'A2A request failed (400): context window exceeded'
      )
      expect(result.category).toBe('context-window')
    })

    it('classifies token limit error from message', () => {
      const result = classifyError('too many tokens in the request')
      expect(result.category).toBe('context-window')
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

describe('isRetryable', () => {
  it.each([
    ['rate-limit', true],
    ['service-unavailable', true],
    ['network', true],
    ['unknown', true],
    ['auth-expired', false],
    ['no-stack', false],
    ['quota-exceeded', false],
    ['context-window', false],
  ] as const)('returns %s for %s', (category, expected) => {
    expect(isRetryable(category)).toBe(expected)
  })
})
