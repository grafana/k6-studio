import { describe, expect, it } from 'vitest'

import {
  BrowserTestOptionsSchema,
  defaultBrowserTestOptions,
} from './testOptions'

describe('BrowserTestOptionsSchema', () => {
  it('parses default options', () => {
    const result = BrowserTestOptionsSchema.safeParse(defaultBrowserTestOptions)
    expect(result.success).toBe(true)
  })

  it('rejects HTTP-only metric in browser threshold', () => {
    const result = BrowserTestOptionsSchema.safeParse({
      ...defaultBrowserTestOptions,
      thresholds: [
        {
          id: '1',
          metric: 'http_req_duration',
          statistic: 'avg',
          condition: '<',
          value: 100,
          stopTest: false,
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts browser_web_vital_lcp threshold', () => {
    const result = BrowserTestOptionsSchema.safeParse({
      ...defaultBrowserTestOptions,
      thresholds: [
        {
          id: '1',
          metric: 'browser_web_vital_lcp',
          statistic: 'p(95)',
          condition: '<',
          value: 1000,
          stopTest: false,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts iteration_duration and checks as cross-cutting metrics', () => {
    for (const metric of ['iteration_duration', 'checks'] as const) {
      const result = BrowserTestOptionsSchema.safeParse({
        ...defaultBrowserTestOptions,
        thresholds: [
          {
            id: '1',
            metric,
            statistic: 'avg',
            condition: '<',
            value: 100,
            stopTest: false,
          },
        ],
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects deprecated browser_web_vital_fid', () => {
    const result = BrowserTestOptionsSchema.safeParse({
      ...defaultBrowserTestOptions,
      thresholds: [
        {
          id: '1',
          metric: 'browser_web_vital_fid',
          statistic: 'avg',
          condition: '<',
          value: 100,
          stopTest: false,
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})
