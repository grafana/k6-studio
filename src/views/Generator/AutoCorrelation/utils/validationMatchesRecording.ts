import { compareResponseValues, ValueMismatch } from './compareValues'
import { StrippedProxyData } from './stripRequestData'

interface ValidationMismatch {
  request: {
    method: string
    url: string
  }
  statusCodeMismatch?: {
    expected: number
    actual: number
  }
  valueMismatches?: ValueMismatch[]
}

interface ValidationResult {
  success: boolean
  details?: {
    reason: string
    mismatches?: ValidationMismatch[]
  }
}

export function validationMatchesRecording(
  recording: StrippedProxyData[],
  validation: StrippedProxyData[]
): ValidationResult {
  const allMismatches: ValidationMismatch[] = []

  for (const req of validation) {
    const matchingReq = findMatchingRequest(req, recording)

    if (!matchingReq) {
      // Request may not be present in case url was changed by rules
      continue
    }

    const mismatch: ValidationMismatch = {
      request: {
        method: req.request.method,
        url: req.request.url,
      },
    }

    let hasMismatch = false

    // Check status code
    const statusMatch =
      matchingReq?.response?.statusCode === req.response?.statusCode ||
      req.response?.statusCode === 304

    if (!statusMatch) {
      mismatch.statusCodeMismatch = {
        expected: matchingReq?.response?.statusCode ?? 0,
        actual: req.response?.statusCode ?? 0,
      }
      hasMismatch = true
    }

    // Check for value mismatches in response
    if (matchingReq.response && req.response) {
      const valueComparison = compareResponseValues(matchingReq, req)

      if (valueComparison.hasMatches && valueComparison.mismatches.length > 0) {
        mismatch.valueMismatches = valueComparison.mismatches
        hasMismatch = true
      }
    }

    if (hasMismatch) {
      allMismatches.push(mismatch)
    }
  }

  const allResponseCodesMatch = allMismatches.every(
    (m) => m.statusCodeMismatch === undefined
  )

  const statusCodeMismatches = allMismatches.filter(
    (m) => m.statusCodeMismatch !== undefined
  )

  const reasons = statusCodeMismatches
    .slice(0, 10)
    .map(
      (m) =>
        `Expected ${m.statusCodeMismatch?.expected} but got ${m.statusCodeMismatch?.actual} for ${m.request.method} ${m.request.url}`
    )

  return {
    success: allResponseCodesMatch,
    details: {
      reason: reasons.join('\n'),
      mismatches: allMismatches,
    },
  }
}

function findMatchingRequest(
  request: StrippedProxyData,
  requests: StrippedProxyData[]
): StrippedProxyData | undefined {
  return requests.find(
    (r) =>
      r.request.url === request.request.url &&
      r.request.method === request.request.method
  )
}
