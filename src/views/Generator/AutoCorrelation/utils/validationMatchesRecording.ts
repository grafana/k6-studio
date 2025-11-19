import { ProxyData } from '@/types'

import { stripUnnecessaryData } from './stripRequestData'

export function validationMatchesRecording(
  recording: ProxyData[],
  validation: ProxyData[]
) {
  for (const req of validation) {
    const matchingReq = findMatchingRequest(req, recording)

    if (!matchingReq) {
      // Request may not be present in case url was changed by rules
      continue
    }

    const statusMatch =
      matchingReq?.response?.statusCode === req.response?.statusCode ||
      req.response?.statusCode === 304

    if (!statusMatch) {
      const reason = `Status code mismatch for ${req.request.method} ${req.request.url}: expected ${matchingReq?.response?.statusCode}, got ${req.response?.statusCode}`

      return {
        success: false,
        details: {
          expected: stripUnnecessaryData(matchingReq),
          actual: stripUnnecessaryData(req),
          reason,
        },
      }
    }
  }

  return { success: true }
}

function findMatchingRequest(
  request: ProxyData,
  requests: ProxyData[]
): ProxyData | undefined {
  return requests.find(
    (r) =>
      r.request.url === request.request.url &&
      r.request.method === request.request.method
  )
}
