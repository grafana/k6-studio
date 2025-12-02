import { Header } from '@/types'
import { safeJsonParse } from '@/utils/json'

import { StrippedProxyData } from './stripRequestData'

const MAX_RECURSION_DEPTH = 5
const MAX_MISMATCHES = 20
const MAX_CONTENT_LENGTH = 1000
const MAX_ARRAY_LENGTH = 10
const CONTENT_PREVIEW_LENGTH = 500

const SKIP_HEADERS = [
  'date',
  'age',
  'expires',
  'last-modified',
  'etag',
  'x-request-id',
  'x-correlation-id',
  'x-trace-id',
  'x-span-id',
  'x-amzn-requestid',
  'x-amzn-trace-id',
  'cf-ray',
  'content-length',
  'transfer-encoding',
  'content-type',
  'user-agent',
]

export interface ValueMismatch {
  path: string
  expected: string
  actual: string
  location: 'header' | 'body'
}

export interface ComparisonResult {
  hasMatches: boolean
  mismatches: ValueMismatch[]
}

type MismatchLocation = ValueMismatch['location']

function createMismatch(
  path: string,
  expected: unknown,
  actual: unknown,
  location: MismatchLocation
): ValueMismatch {
  return {
    path,
    expected: String(expected),
    actual: String(actual),
    location,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function isPrimitive(
  value: unknown
): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

export function compareResponseValues(
  expected: StrippedProxyData,
  actual: StrippedProxyData
): ComparisonResult {
  if (!expected.response || !actual.response) {
    return { hasMatches: false, mismatches: [] }
  }

  const headerMismatches = compareHeaders(
    expected.response.headers,
    actual.response.headers
  )

  const bodyMismatches = compareContent(
    expected.response.content,
    actual.response.content
  )

  const mismatches = [...headerMismatches, ...bodyMismatches]

  return {
    hasMatches: mismatches.length > 0,
    mismatches,
  }
}

function compareHeaders(
  expectedHeaders: Header[],
  actualHeaders: Header[]
): ValueMismatch[] {
  const mismatches: ValueMismatch[] = []
  const expectedMap = normalizeHeaders(expectedHeaders)
  const actualMap = normalizeHeaders(actualHeaders)

  for (const [key, expectedValue] of expectedMap) {
    if (shouldSkipHeader(key)) {
      continue
    }

    const actualValue = actualMap.get(key)

    // Only report mismatch if header exists in both but values differ
    if (actualValue === undefined) {
      continue
    }

    if (normalizeValue(actualValue) !== normalizeValue(expectedValue)) {
      mismatches.push(
        createMismatch(
          `response.headers.${key}`,
          expectedValue,
          actualValue,
          'header'
        )
      )
    }
  }

  return mismatches
}

function normalizeHeaders(headers: Header[]) {
  return new Map(
    headers.map(([key, value]) => {
      const lowerKey = key.toLowerCase()
      const normalizedKey =
        lowerKey === 'set-cookie'
          ? `${lowerKey}.${parseCookieName(value)}`
          : lowerKey
      return [normalizedKey, value]
    })
  )
}

function parseCookieName(value: string) {
  return value.split(';')[0]?.split('=')[0]?.trim()
}

function shouldSkipHeader(key: string) {
  return SKIP_HEADERS.includes(key.toLowerCase())
}

function normalizeValue(value: string) {
  return value.trim()
}

function compareContent(
  expectedContent: string | null,
  actualContent: string | null
): ValueMismatch[] {
  if (!expectedContent || !actualContent) {
    return []
  }

  const expectedJson = safeJsonParse(expectedContent)
  const actualJson = safeJsonParse(actualContent)

  if (expectedJson && actualJson) {
    return compareJSON(expectedJson, actualJson, '')
  }

  if (expectedContent === actualContent) {
    return []
  }

  // Only report if content is small enough to be meaningful
  if (
    expectedContent.length >= MAX_CONTENT_LENGTH ||
    actualContent.length >= MAX_CONTENT_LENGTH
  ) {
    return []
  }

  return [
    createMismatch(
      'response.content',
      expectedContent.substring(0, CONTENT_PREVIEW_LENGTH),
      actualContent.substring(0, CONTENT_PREVIEW_LENGTH),
      'body'
    ),
  ]
}

function compareJSON(
  expected: unknown,
  actual: unknown,
  path: string,
  depth = 0
): ValueMismatch[] {
  if (depth > MAX_RECURSION_DEPTH) {
    return []
  }

  if (expected === null || actual === null) {
    return compareNullValues(expected, actual, path)
  }

  if (isPrimitive(expected) && isPrimitive(actual)) {
    return comparePrimitives(expected, actual, path)
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    return compareArrays(expected, actual, path, depth)
  }

  if (isPlainObject(expected) && isPlainObject(actual)) {
    return compareObjects(expected, actual, path, depth)
  }

  return []
}

function compareNullValues(
  expected: unknown,
  actual: unknown,
  path: string
): ValueMismatch[] {
  if (expected === actual) {
    return []
  }

  return [createMismatch(`response.body${path}`, expected, actual, 'body')]
}

function comparePrimitives(
  expected: string | number | boolean | null,
  actual: string | number | boolean | null,
  path: string
): ValueMismatch[] {
  if (expected === actual) {
    return []
  }

  return [createMismatch(`response.body${path}`, expected, actual, 'body')]
}

function compareArrays(
  expected: unknown[],
  actual: unknown[],
  path: string,
  depth: number
): ValueMismatch[] {
  // Only compare arrays with same length and reasonable size
  if (
    expected.length !== actual.length ||
    expected.length >= MAX_ARRAY_LENGTH
  ) {
    return []
  }

  const mismatches: ValueMismatch[] = []

  for (let i = 0; i < expected.length; i++) {
    const itemMismatches = compareJSON(
      expected[i],
      actual[i],
      `${path}[${i}]`,
      depth + 1
    )
    mismatches.push(...itemMismatches)
  }

  return mismatches
}

function compareObjects(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>,
  path: string,
  depth: number
): ValueMismatch[] {
  const mismatches: ValueMismatch[] = []
  const commonKeys = Object.keys(expected).filter((key) => key in actual)

  for (const key of commonKeys) {
    if (mismatches.length > MAX_MISMATCHES) {
      break
    }

    const keyPath = path ? `${path}.${key}` : `.${key}`
    const expectedValue = expected[key]
    const actualValue = actual[key]

    if (isPrimitive(expectedValue) && isPrimitive(actualValue)) {
      if (expectedValue !== actualValue) {
        mismatches.push(
          createMismatch(
            `response.body${keyPath}`,
            expectedValue,
            actualValue,
            'body'
          )
        )
      }
      continue
    }

    // Recurse for nested structures
    const nestedMismatches = compareJSON(
      expectedValue,
      actualValue,
      keyPath,
      depth + 1
    )
    mismatches.push(...nestedMismatches)
  }

  return mismatches
}
