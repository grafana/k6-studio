import { describe, it, expect } from 'vitest'

import { summarizeValidationForAI } from './summarizeValidationForAI'
import type { ValidationResult } from './validationMatchesRecording'

const statusOnly = (url: string, expected: number, actual: number) => ({
  request: { method: 'GET', url },
  statusCodeMismatch: { expected, actual },
})

describe('summarizeValidationForAI', () => {
  it('groups status-only mismatches by delta, keeping every url (lossless)', () => {
    const result: ValidationResult = {
      success: false,
      details: {
        mismatches: [
          statusOnly('http://a.com/1', 200, 401),
          statusOnly('http://a.com/2', 200, 401),
          statusOnly('http://a.com/3', 200, 401),
          statusOnly('http://a.com/4', 200, 503),
        ],
      },
    }

    const summary = summarizeValidationForAI(result)

    expect(summary.statusMismatches).toEqual([
      {
        expected: 200,
        actual: 401,
        requests: [
          'GET http://a.com/1',
          'GET http://a.com/2',
          'GET http://a.com/3',
        ],
      },
      { expected: 200, actual: 503, requests: ['GET http://a.com/4'] },
    ])
  })

  it('keeps method so same-path different-method requests stay distinct', () => {
    const result: ValidationResult = {
      success: false,
      details: {
        mismatches: [
          {
            request: { method: 'GET', url: 'http://a.com/x' },
            statusCodeMismatch: { expected: 200, actual: 401 },
          },
          {
            request: { method: 'POST', url: 'http://a.com/x' },
            statusCodeMismatch: { expected: 200, actual: 401 },
          },
        ],
      },
    }

    const summary = summarizeValidationForAI(result)

    expect(summary.statusMismatches[0]?.requests).toEqual([
      'GET http://a.com/x',
      'POST http://a.com/x',
    ])
  })

  it('keeps value mismatches in full as correlation targets', () => {
    const result: ValidationResult = {
      success: false,
      details: {
        mismatches: [
          {
            request: { method: 'POST', url: 'http://a.com/login' },
            valueMismatches: [
              {
                path: 'response.headers.set-cookie.session',
                expected: 'a',
                actual: 'b',
                location: 'header',
              },
            ],
          },
        ],
      },
    }

    const summary = summarizeValidationForAI(result)

    expect(summary.valueMismatches).toHaveLength(1)
    expect(summary.statusMismatches).toHaveLength(0)
    expect(summary.valueMismatches[0]?.valueMismatches?.[0]?.path).toBe(
      'response.headers.set-cookie.session'
    )
  })

  it('treats an entry with both status and value mismatch as a value target, not a cascade', () => {
    const result: ValidationResult = {
      success: false,
      details: {
        mismatches: [
          {
            request: { method: 'POST', url: 'http://a.com/x' },
            statusCodeMismatch: { expected: 200, actual: 401 },
            valueMismatches: [
              {
                path: 'response.body.token',
                expected: 'a',
                actual: 'b',
                location: 'body',
              },
            ],
          },
        ],
      },
    }

    const summary = summarizeValidationForAI(result)

    expect(summary.valueMismatches).toHaveLength(1)
    expect(summary.statusMismatches).toHaveLength(0)
  })

  it('passes through success with empty buckets', () => {
    const summary = summarizeValidationForAI({ success: true })

    expect(summary).toEqual({
      success: true,
      valueMismatches: [],
      statusMismatches: [],
    })
  })

  it('is smaller than the raw result for a large status cascade', () => {
    const mismatches = Array.from({ length: 90 }, (_, index) =>
      statusOnly(`http://a.com/path/${index}`, 200, 401)
    )
    const result: ValidationResult = {
      success: false,
      details: { mismatches },
    }

    const rawSize = JSON.stringify(result).length
    const summarySize = JSON.stringify(summarizeValidationForAI(result)).length

    expect(summarySize).toBeLessThan(rawSize)
  })
})
