import { describe, expect, it } from 'vitest'

import {
  createProxyData,
  createProxyDataWithoutResponse,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'

import { computeResponseTimeStats } from './responseTimeStats'

function requestWithTiming({
  durationSeconds,
  statusCode = 200,
}: {
  durationSeconds: number
  statusCode?: number
}) {
  return createProxyData({
    request: createRequest({ timestampStart: 100 }),
    response: createResponse({
      statusCode,
      timestampStart: 100 + durationSeconds / 2,
      timestampEnd: 100 + durationSeconds,
    }),
  })
}

describe('computeResponseTimeStats', () => {
  it('computes percentiles and averages in milliseconds', () => {
    const requests = [0.1, 0.2, 0.3, 0.4, 0.5].map((durationSeconds) =>
      requestWithTiming({ durationSeconds })
    )

    const stats = computeResponseTimeStats(requests)

    expect(stats.hasTimingData).toBe(true)
    expect(stats.requestCount).toBe(5)
    expect(stats.avg).toBe(300)
    expect(stats.min).toBe(100)
    expect(stats.max).toBe(500)
    expect(stats.p50).toBe(300)
    expect(stats.p95).toBe(500)
  })

  it('computes the failure rate from status codes', () => {
    const requests = [
      requestWithTiming({ durationSeconds: 0.1 }),
      requestWithTiming({ durationSeconds: 0.1, statusCode: 500 }),
      requestWithTiming({ durationSeconds: 0.1, statusCode: 404 }),
      requestWithTiming({ durationSeconds: 0.1 }),
    ]

    expect(computeResponseTimeStats(requests).failureRate).toBe(0.5)
  })

  it('counts requests without a response as failures', () => {
    const requests = [
      requestWithTiming({ durationSeconds: 0.1 }),
      createProxyDataWithoutResponse(),
    ]

    expect(computeResponseTimeStats(requests).failureRate).toBe(0.5)
  })

  it('falls back to the request timestamps for HAR-imported recordings', () => {
    const requests = [
      createProxyData({
        request: createRequest({ timestampStart: 100, timestampEnd: 100.25 }),
        response: createResponse({ timestampStart: 0, timestampEnd: 0 }),
      }),
    ]

    const stats = computeResponseTimeStats(requests)

    expect(stats.hasTimingData).toBe(true)
    expect(stats.max).toBe(250)
  })

  it('flags recordings without timing data', () => {
    const requests = [
      createProxyData({
        request: createRequest({ timestampStart: 0, timestampEnd: 0 }),
        response: createResponse({ timestampStart: 0, timestampEnd: 0 }),
      }),
    ]

    const stats = computeResponseTimeStats(requests)

    expect(stats.hasTimingData).toBe(false)
    expect(stats.requestCount).toBe(1)
  })
})
