import { TestRule } from '@/schemas/rules'
import { RequestSnippetSchema } from '@/types'
import { exhaustive } from '@/utils/typescript'

/**
 * Converts a header key to its canonical form.
 * ex. content-type -> Content-Type
 */
export function canonicalHeaderKey(headerKey: string) {
  return headerKey
    .toLowerCase()
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-')
}

/**
 * Generates sequential integers to be used for generated variables distinction for the final script.
 */
export function* generateSequentialInt(): Generator<number> {
  let num = 0
  while (true) {
    yield num
    num += 1
  }
}

export function matchFilter(
  { data: { request } }: RequestSnippetSchema,
  rule: TestRule
) {
  switch (rule.type) {
    case 'correlation': {
      const {
        extractor: { filter },
      } = rule
      return request.url.toLowerCase().includes(filter.path.toLowerCase())
    }
    case 'customCode':
    case 'parameterization':
    case 'verification': {
      const { filter } = rule
      return request.url.toLowerCase().includes(filter.path.toLowerCase())
    }
    default:
      return exhaustive(rule)
  }
}
