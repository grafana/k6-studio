import { TestRule } from '@/types/rules'
import { RequestSnippetSchema, Response } from '@/types'
import { exhaustive } from '@/utils/typescript'
import { getHeaderValues } from '@/utils/headers'

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
  try {
    switch (rule.type) {
      case 'correlation': {
        const {
          extractor: { filter },
        } = rule
        return new RegExp(filter.path).test(request.url)
      }
      case 'customCode':
      case 'parameterization':
      case 'verification': {
        const { filter } = rule
        return new RegExp(filter.path).test(request.url)
      }
      default:
        return exhaustive(rule)
    }
  } catch (e) {
    console.error(e)
    return false
  }
}

export const isJsonResponse = (response: Response) => {
  const contentTypeValues = getHeaderValues(response.headers, 'content-type')
  let contentTypeValue = contentTypeValues ? contentTypeValues[0] : undefined

  // NOTE: this is a small hack to skip google malformed json that starts this way, those requests are made automatically by the chrome
  // browser. Most likely we want a better way of filtering them out since it can't be just parsed
  if (response.content.startsWith(')]}')) {
    contentTypeValue = undefined
  }

  // works only on json
  if (!contentTypeValue || !contentTypeValue.includes('application/json')) {
    return false
  }

  return true
}
