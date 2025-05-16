import { escapeRegExp } from 'lodash-es'

import { Response, Request, Query } from '@/types'
import { Filter } from '@/types/rules'
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
export function* generateSequentialInt(): Generator<number, number, number> {
  let num = 0
  while (true) {
    yield num
    num += 1
  }
}

export function matchFilter(request: Request, filter: Filter) {
  try {
    return new RegExp(escapeRegExp(filter.path)).test(request.url)
  } catch (e) {
    console.error(e)
    return false
  }
}

export const isJsonReqResp = (reqResp: Request | Response) => {
  const contentTypeValues = getHeaderValues(reqResp.headers, 'content-type')
  const contentTypeValue = contentTypeValues ? contentTypeValues[0] : undefined

  // check Content-Type header
  if (!contentTypeValue || !contentTypeValue.includes('application/json')) {
    return false
  }

  // check content
  try {
    JSON.parse(reqResp.content ?? '')
  } catch (error) {
    return false
  }

  return true
}

export function urlToQueryParams(url: string): Query[] {
  try {
    const urlObj = new URL(url)
    return Array.from(urlObj.searchParams.entries())
  } catch (error) {
    return []
  }
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

  const generateRequest = (
    content: string,
    contentType: string = 'application/json'
  ): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers: [['Content-Type', contentType]],
      cookies: [],
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content,
      path: '/api/v1/foo',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    }
  }

  it('is json response', () => {
    expect(isJsonReqResp(generateResponse('{"hello":"world"}'))).toBe(true)
    expect(isJsonReqResp(generateResponse('[{"hello":"world"}]'))).toBe(true)
    expect(isJsonReqResp(generateResponse('{"hello":world"}hello'))).toBe(false)
    expect(isJsonReqResp(generateResponse(')]}'))).toBe(false)
    expect(
      isJsonReqResp(generateResponse('{"hello":"world"}', 'text/plain'))
    ).toBe(false)
  })

  it('is json request', () => {
    expect(isJsonReqResp(generateRequest('{"hello":"world"}'))).toBe(true)
    expect(isJsonReqResp(generateRequest('[{"hello":"world"}]'))).toBe(true)
    expect(isJsonReqResp(generateRequest('{"hello":world"}hello'))).toBe(false)
    expect(isJsonReqResp(generateRequest(')]}'))).toBe(false)
    expect(
      isJsonReqResp(generateRequest('{"hello":"world"}', 'text/plain'))
    ).toBe(false)
  })
}
