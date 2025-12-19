import execution from 'k6/execution'
import type { RefinedParams, ResponseType } from 'k6/http'

export function instrumentParams<RT extends ResponseType | undefined>(
  params: RefinedParams<RT> | null | undefined
) {
  const safeParams = params ?? {}

  // Trim and remove prefix
  const group = `${execution.vu.metrics.tags.group}`.trim().replace(/^::/, '')
  const groupHeaders = {
    'X-k6-group': group,
  }

  const updatedParams = Object.assign({}, safeParams, {
    headers: Object.assign({}, safeParams.headers || {}, groupHeaders),
  })

  return updatedParams
}
