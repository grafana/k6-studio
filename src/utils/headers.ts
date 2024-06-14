import { Header } from '@/types'

// Headers could have multiple tuples with the same key
export function getHeaderValues(headers: Header[], name: string) {
  return headers
    .filter(([key]) => key.toLowerCase() === name.toLowerCase())
    .map(([, value]) => value)
}

/**
 * Returns the value of the content type header including the charset
 * @example
 * application/json; charset=utf-8
 */
export function getContentTypeHeader(headers: Header[]) {
  return getHeaderValues(headers, 'content-type')[0]
}

/**
 * Returns the content type without the charset
 * @example
 * application/json
 */
export function getContentType(headers: Header[]) {
  return getContentTypeHeader(headers)?.split(';')[0]
}
