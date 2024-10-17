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
export function getContentTypeWithCharsetHeader(headers: Header[]) {
  return getHeaderValues(headers, 'content-type')[0]
}

/**
 * Returns the content type without the charset
 * @example
 * application/json
 */
export function getContentType(headers: Header[]) {
  return getContentTypeWithCharsetHeader(headers)?.split(';')[0]
}

/**
 * Returns the header with the updated value
 */
export function upsertHeader(
  headers: Header[],
  key: string,
  value: string
): Header[] {
  return [
    ...headers.filter(
      ([existingKey]) => existingKey.toLowerCase() !== key.toLowerCase()
    ),
    [key, value],
  ]
}

/**
 * Returns the value of the location header
 * @example
 * application/json
 */
export function getLocationHeader(headers: Header[]) {
  return getHeaderValues(headers, 'location')[0]
}

export function getUpgradeHeader(headers: Header[]) {
  return getHeaderValues(headers, 'upgrade')[0]
}
