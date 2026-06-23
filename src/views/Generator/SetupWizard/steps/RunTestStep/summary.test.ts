import { describe, expect, it } from 'vitest'

import { createThreshold } from '@/test/factories/threshold'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import {
  formatThresholds,
  getLoadSummary,
  parseDurationSeconds,
} from './summary'

describe('parseDurationSeconds', () => {
  it.each([
    ['1m', 60],
    ['3m30s', 210],
    ['45s', 45],
    ['1h2m3s', 3723],
    ['2h', 7200],
  ])('parses %s as %d seconds', (duration, expected) => {
    expect(parseDurationSeconds(duration)).toBe(expected)
  })
})

describe('getLoadSummary', () => {
  it('summarizes the default ramping stages', () => {
    const summary = getLoadSummary({
      executor: 'ramping-vus',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
    })

    expect(summary.headline).toBe('Up to 20 virtual users for ~5m 30s')
    expect(summary.detail).toBe(
      'Ramp to 20 VUs over 1m · hold 20 VUs for 3m30s · ramp down to 0 over 1m'
    )
  })

  it('summarizes shared iterations', () => {
    const summary = getLoadSummary({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 100,
    })

    expect(summary.headline).toBe(
      '100 iterations shared across 5 virtual users'
    )
    expect(summary.detail).toBe('')
  })

  it('falls back to k6 defaults for shared iterations', () => {
    const summary = getLoadSummary({ executor: 'shared-iterations' })

    expect(summary.headline).toBe('1 iteration shared across 1 virtual user')
  })

  it('handles an empty stage list', () => {
    const summary = getLoadSummary({ executor: 'ramping-vus', stages: [] })

    expect(summary.headline).toBe('No load stages configured')
  })
})

const p95Threshold = {
  statistic: 'p(95)',
  condition: '<',
  value: 300,
} as const

describe('formatThresholds', () => {
  it('formats response time and failure rate thresholds', () => {
    const thresholds = [
      createThreshold(p95Threshold),
      createThreshold({ statistic: 'p(99)', condition: '<', value: 400 }),
      createThreshold({
        metric: 'http_req_failed',
        statistic: 'rate',
        condition: '<',
        value: 0.01,
        stopTest: true,
      }),
    ]

    expect(formatThresholds(thresholds, HTTP_METRICS_CONFIG)).toBe(
      'p95 < 300ms · p99 < 400ms · error rate < 1% (stops test)'
    )
  })

  it('rounds float artifacts in the failure rate percentage', () => {
    const thresholds = [
      createThreshold({
        metric: 'http_req_failed',
        statistic: 'rate',
        condition: '<',
        value: 0.07,
      }),
    ]

    expect(formatThresholds(thresholds, HTTP_METRICS_CONFIG)).toBe(
      'error rate < 7%'
    )
  })

  it('includes the metric label for other metrics', () => {
    const thresholds = [
      createThreshold({
        metric: 'data_sent',
        statistic: 'count',
        condition: '<',
        value: 1024,
      }),
    ]

    expect(formatThresholds(thresholds, HTTP_METRICS_CONFIG)).toBe(
      'Data sent count < 1024 bytes'
    )
  })

  it('skips disabled thresholds', () => {
    const thresholds = [
      createThreshold(p95Threshold),
      createThreshold({ value: 999, enabled: false }),
    ]

    expect(formatThresholds(thresholds, HTTP_METRICS_CONFIG)).toBe(
      'p95 < 300ms'
    )
  })
})
