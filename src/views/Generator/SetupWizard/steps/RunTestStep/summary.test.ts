import { describe, expect, it } from 'vitest'

import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'
import { createThreshold } from '@/test/factories/threshold'
import { ThinkTime } from '@/types/testOptions'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import {
  buildStageSegments,
  computeVuHours,
  formatThresholds,
  getLoadSummary,
  parseDurationSeconds,
} from './summary'

const NO_THINK_TIME: ThinkTime = {
  sleepType: 'iterations',
  timing: { type: 'fixed', value: null },
}

// A request whose recorded duration is `seconds` (response ends that much after
// the request starts).
function requestLasting(seconds: number, group?: string) {
  return createProxyData({
    group,
    request: createRequest({ timestampStart: 100 }),
    response: createResponse({
      timestampStart: 100,
      timestampEnd: 100 + seconds,
    }),
  })
}

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

describe('computeVuHours', () => {
  it('sums the trapezoidal area under the ramping VU curve', () => {
    // 0->20 over 1m (avg 10), hold 20 for 1m (avg 20), 20->0 over 1m (avg 10)
    // => (10 + 20 + 10) * 60s = 2400 VU-seconds => 2400 / 3600 VU-hours.
    const vuHours = computeVuHours(
      {
        executor: 'ramping-vus',
        stages: [
          { target: 20, duration: '1m' },
          { target: 20, duration: '1m' },
          { target: 0, duration: '1m' },
        ],
      },
      [],
      NO_THINK_TIME
    )

    expect(vuHours).toBeCloseTo(2400 / 3600, 5)
  })

  it('returns null for ramping with no stages', () => {
    expect(
      computeVuHours({ executor: 'ramping-vus', stages: [] }, [], NO_THINK_TIME)
    ).toBeNull()
  })

  it('estimates shared iterations from recorded request durations', () => {
    // Two 0.5s requests => 1s of work per iteration, 100 iterations.
    const vuHours = computeVuHours(
      { executor: 'shared-iterations', vus: 5, iterations: 100 },
      [requestLasting(0.5), requestLasting(0.5)],
      NO_THINK_TIME
    )

    expect(vuHours).toBeCloseTo(100 / 3600, 5)
  })

  it('adds per-request think time to the shared-iterations estimate', () => {
    // 1s of requests + 1s sleep per request (x2) = 3s per iteration.
    const vuHours = computeVuHours(
      { executor: 'shared-iterations', iterations: 100 },
      [requestLasting(0.5), requestLasting(0.5)],
      { sleepType: 'requests', timing: { type: 'fixed', value: 1 } }
    )

    expect(vuHours).toBeCloseTo((100 * 3) / 3600, 5)
  })

  it('adds per-group think time using the recorded groups', () => {
    // 1s of requests + 1s sleep x 2 groups = 3s per iteration.
    const vuHours = computeVuHours(
      { executor: 'shared-iterations', iterations: 100 },
      [requestLasting(0.5, 'login'), requestLasting(0.5, 'checkout')],
      {
        sleepType: 'groups',
        timing: { type: 'range', value: { min: 0, max: 2 } },
      }
    )

    expect(vuHours).toBeCloseTo((100 * 3) / 3600, 5)
  })

  it('returns null for shared iterations without an iteration count', () => {
    expect(
      computeVuHours(
        { executor: 'shared-iterations', vus: 5 },
        [requestLasting(0.5)],
        NO_THINK_TIME
      )
    ).toBeNull()
  })

  it('returns null for shared iterations when the recording has no timing', () => {
    const untimed = createProxyData({
      request: createRequest({ timestampStart: 0 }),
      response: createResponse({ timestampStart: 0, timestampEnd: 0 }),
    })

    expect(
      computeVuHours(
        { executor: 'shared-iterations', iterations: 100 },
        [untimed],
        NO_THINK_TIME
      )
    ).toBeNull()
  })
})
