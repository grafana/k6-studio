import type {
  ValidationMismatch,
  ValidationResult,
} from './validationMatchesRecording'

interface StatusMismatchGroup {
  expected: number
  actual: number
  // Each entry is "METHOD url" so method survives the grouping.
  requests: string[]
}

export interface ValidationSummaryForAI {
  success: boolean
  // Entries with value-level diffs are real correlation targets, kept in full.
  valueMismatches: ValidationMismatch[]
  // Status-only mismatches grouped by delta: every request (method + url) is
  // retained, only the repeated per-entry scaffolding is dropped. A missing
  // auth correlation produces one cascade group rather than N entries.
  statusMismatches: StatusMismatchGroup[]
}

function hasValueMismatch(mismatch: ValidationMismatch): boolean {
  return (mismatch.valueMismatches?.length ?? 0) > 0
}

function groupStatusMismatches(
  mismatches: ValidationMismatch[]
): StatusMismatchGroup[] {
  const groups = new Map<string, StatusMismatchGroup>()

  for (const mismatch of mismatches) {
    const { statusCodeMismatch, request } = mismatch
    if (!statusCodeMismatch) {
      continue
    }

    const key = `${statusCodeMismatch.expected}->${statusCodeMismatch.actual}`
    let group = groups.get(key)
    if (!group) {
      group = {
        expected: statusCodeMismatch.expected,
        actual: statusCodeMismatch.actual,
        requests: [],
      }
      groups.set(key, group)
    }
    group.requests.push(`${request.method} ${request.url}`)
  }

  return [...groups.values()]
}

/**
 * Collapses a validation result into the compact form sent to the AI. Real
 * correlation targets (value mismatches) are preserved verbatim; status-only
 * mismatches are grouped by delta so a downstream failure cascade does not
 * dominate the payload with repeated entries.
 */
export function summarizeValidationForAI(
  result: ValidationResult
): ValidationSummaryForAI {
  const mismatches = result.details?.mismatches ?? []

  const valueMismatches = mismatches.filter(hasValueMismatch)
  const statusOnly = mismatches.filter(
    (mismatch) => !hasValueMismatch(mismatch)
  )

  return {
    success: result.success,
    valueMismatches,
    statusMismatches: groupStatusMismatches(statusOnly),
  }
}
