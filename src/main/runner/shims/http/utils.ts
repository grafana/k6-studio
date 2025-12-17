import execution from 'k6/execution'
import type { RefinedParams, ResponseType } from 'k6/http'

export function instrumentParams<RT extends ResponseType | undefined>(
  params: RefinedParams<RT> | null = {}
) {
  // Trim and remove prefix
  const group = `${execution.vu.metrics.tags.group}`.trim().replace(/^::/, '')
  const groupHeaders = {
    'X-k6-group': group,
  }

  const updatedParams = Object.assign({}, params, {
    headers: Object.assign({}, params?.headers || {}, groupHeaders),
  })

  return updatedParams
}
