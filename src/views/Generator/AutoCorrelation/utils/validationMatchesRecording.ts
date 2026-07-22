import { StrippedProxyData } from '@/utils/assistant/stripRequestData'

import { compareResponseValues, ValueMismatch } from './compareValues'

export interface ValidationMismatch {
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

export interface ValidationResult {
  success: boolean
  details?: {
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

  return {
    success: allResponseCodesMatch,
    details: {
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
