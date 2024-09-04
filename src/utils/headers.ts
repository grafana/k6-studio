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
 * Returns the index of a particular header
 */
export function findHeaderIndex(headers: Header[], key: string) {
  if (!headers) {
    return -1
  }
  return headers.findIndex(
    ([k]) => k.toLocaleLowerCase() === key.toLocaleLowerCase()
  )
}

/**
 * Updates the value of a header in-place if the key exists
 * or inserts the key-value pair at the end of the header if the key doesn't exist
 */
export function upsertHeader(headers: Header[], key: string, value: string) {
  if (key === '') {
    return
  }
  const index = findHeaderIndex(headers, key)
  if (index !== -1) {
    headers[index] = [key, value]
  } else {
    headers.push([key, value])
  }
}
