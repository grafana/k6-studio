import { ProxyData } from '@/types'

export interface ResponseTimeStats {
  requestCount: number
  /** False when the recording carries no usable timestamps (e.g. some HAR imports). */
  hasTimingData: boolean
  failureRate: number
  min: number
  max: number
  avg: number
  p50: number
  p90: number
  p95: number
}

function percentile(sortedValues: number[], fraction: number): number {
  if (sortedValues.length === 0) {
    return 0
  }

  const index = Math.min(
    Math.ceil(fraction * sortedValues.length) - 1,
    sortedValues.length - 1
  )

  return sortedValues[Math.max(index, 0)] ?? 0
}

/**
 * Approximates per-request response times (in ms) as the delta between the
 * request start and the first response byte.
 */
export function computeResponseTimeStats(
  requests: ProxyData[]
): ResponseTimeStats {
  const durations = requests
    .flatMap(({ request, response }) => {
      if (!response || !request.timestampStart || !response.timestampStart) {
        return []
      }

      const duration = (response.timestampStart - request.timestampStart) * 1000

      return duration > 0 ? [duration] : []
    })
    .sort((left, right) => left - right)

  const failedCount = requests.filter(
    ({ response }) => response !== undefined && response.statusCode >= 400
  ).length

  const sum = durations.reduce((total, duration) => total + duration, 0)

  return {
    requestCount: requests.length,
    hasTimingData: durations.length > 0,
    failureRate: requests.length === 0 ? 0 : failedCount / requests.length,
    min: Math.round(durations[0] ?? 0),
    max: Math.round(durations[durations.length - 1] ?? 0),
    avg: durations.length === 0 ? 0 : Math.round(sum / durations.length),
    p50: Math.round(percentile(durations, 0.5)),
    p90: Math.round(percentile(durations, 0.9)),
    p95: Math.round(percentile(durations, 0.95)),
  }
}
