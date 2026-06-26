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
 * Computes the per-request duration in ms. Live proxy data carries response
 * timestamps; HAR-imported recordings encode the entry's total time as
 * `request.timestampEnd` (see harToProxyData).
 */
export function getRequestDuration({ request, response }: ProxyData): number {
  if (!request.timestampStart) {
    return 0
  }

  const candidates = [
    response?.timestampEnd,
    request.timestampEnd,
    response?.timestampStart,
  ]
  const end = candidates.find((value) => value !== undefined && value > 0)

  return end === undefined ? 0 : (end - request.timestampStart) * 1000
}

export function computeResponseTimeStats(
  requests: ProxyData[]
): ResponseTimeStats {
  const durations = requests
    .map(getRequestDuration)
    .filter((duration) => duration > 0)
    .sort((left, right) => left - right)

  // A request that never received a response (timeout, connection reset) is a
  // failure too, so it counts even though there is no status code to inspect.
  const failedCount = requests.filter(
    ({ response }) => response === undefined || response.statusCode >= 400
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
