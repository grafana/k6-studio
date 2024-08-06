import { TestRule } from '@/types/rules'
import { RequestSnippetSchema, Response, Request } from '@/types'
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
  const contentTypeValue = contentTypeValues ? contentTypeValues[0] : undefined

  // works only on json
  if (!contentTypeValue || !contentTypeValue.includes('application/json')) {
    return false
  }

  // check content
  try {
    JSON.parse(response.content)
  } catch (error) {
    return false
  }

  return true
}

export const isJsonRequest = (request: Request) => {
  const contentTypeValues = getHeaderValues(request.headers, 'content-type')
  const contentTypeValue = contentTypeValues ? contentTypeValues[0] : undefined

  // check Content-Type header
  if (!contentTypeValue || !contentTypeValue.includes('application/json')) {
    return false
  }

  return true
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateResponse = (
    content: string,
    contentType: string = 'application/json'
  ): Response => {
    return {
      statusCode: 200,
      path: '/api/v1/foo',
      reason: 'OK',
      httpVersion: '1.1',
      headers: [['Content-Type', contentType]],
      cookies: [],
      content: content,
      contentLength: 0,
      timestampStart: 0,
    }
  }

  it('is json response', () => {
    expect(isJsonResponse(generateResponse('{"hello":"world"}'))).toBe(true)
    expect(isJsonResponse(generateResponse('[{"hello":"world"}]'))).toBe(true)
    expect(isJsonResponse(generateResponse('{"hello":world"}hello'))).toBe(
      false
    )
    expect(isJsonResponse(generateResponse(')]}'))).toBe(false)
    expect(
      isJsonResponse(generateResponse('{"hello":"world"}', 'text/plain'))
    ).toBe(false)
  })
}
