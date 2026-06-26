import { describe, expect, it } from 'vitest'

import { createThreshold } from '@/test/factories/threshold'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import {
  buildStageSegments,
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

    expect(summary).toBe('Up to 20 virtual users for ~5m 30s')
  })

  it('summarizes shared iterations', () => {
    const summary = getLoadSummary({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 100,
    })

    expect(summary).toBe('100 iterations shared across 5 virtual users')
  })

  it('falls back to k6 defaults for shared iterations', () => {
    const summary = getLoadSummary({ executor: 'shared-iterations' })

    expect(summary).toBe('1 iteration shared across 1 virtual user')
  })

  it('handles an empty stage list', () => {
    const summary = getLoadSummary({ executor: 'ramping-vus', stages: [] })

    expect(summary).toBe('No load stages configured')
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

describe('buildStageSegments', () => {
  it('classifies ramp-up, steady, and ramp-down stages', () => {
    const segments = buildStageSegments({
      executor: 'ramping-vus',
      stages: [
        { target: 50, duration: '1m' },
        { target: 50, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
    })

    expect(segments).toEqual([
      {
        kind: 'ramp-up',
        label: 'Ramp up',
        detail: '0 → 50 VUs',
        duration: '1m',
        seconds: 60,
      },
      {
        kind: 'steady',
        label: 'Steady',
        detail: '50 VUs',
        duration: '3m30s',
        seconds: 210,
      },
      {
        kind: 'ramp-down',
        label: 'Ramp down',
        detail: '50 → 0 VUs',
        duration: '1m',
        seconds: 60,
      },
    ])
  })

  it('returns a single steady segment for shared iterations', () => {
    expect(
      buildStageSegments({
        executor: 'shared-iterations',
        vus: 5,
        iterations: 100,
      })
    ).toEqual([
      {
        kind: 'steady',
        label: 'Steady',
        detail: '5 VUs',
        duration: '',
        seconds: 1,
      },
    ])
  })

  it('falls back to a single VU for shared iterations without vus', () => {
    const [segment] = buildStageSegments({ executor: 'shared-iterations' })

    expect(segment?.detail).toBe('1 VUs')
  })
})
