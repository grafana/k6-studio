import { ProxyData } from '@/types'
import type { HarHeader } from '@/types/recording'
import { SuggestionMode } from '@/views/Generator/RuleEditor/Typeahead/useTypeahead'

import {
  indexThreshold,
  maybeBuildRecordingIndex,
  queryByFullPrefix
} from './index.db'

/**
 * Generates JSON paths based on input data
 * @param data
 */
export function generateJsonPaths(data: string | undefined): string[] {
  const jsonPathsSet = new Set<string>()

  if (!data) {
    return []
  }

  const parsedContent = parseToJsonPaths(data)
  parsedContent.forEach((path) => jsonPathsSet.add(path))

  return Array.from(jsonPathsSet)
}

/**
 * Takes JSON string data and converts them to path notation
 * @example "{pizza: {user: "test"}}" -> "pizza.user.test", "pizza.user", "pizza"
 * @param content
 */
function parseToJsonPaths(content: string): string[] {
  const paths: string[] = []

  try {
    const parsed = JSON.parse(content) as unknown
    const queue: { value: unknown; path: string }[] = [
      { value: parsed, path: '' },
    ]

    while (queue.length > 0) {
      const { value, path } = queue.shift()!

      if (Array.isArray(value)) {
        value.forEach((item: Record<string, unknown>, index) => {
          const arrayPath = `${path}[${index}]`
          paths.push(arrayPath)
          queue.push({ value: item, path: arrayPath })
        })
      } else if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([key, val]) => {
          const objectPath = path ? `${path}.${key}` : key
          paths.push(objectPath)
          queue.push({ value: val, path: objectPath })
        })
      }
    }
  } catch {
    return []
  }

  return paths
}

/**
 * Extracts header values and determines if they have JSON content-type.
 * @param headerValues
 */
export function isJsonContentType(headerValues: HarHeader[]): boolean {
  return headerValues.some((header) => {
    const name = header.name
    const value = header.value
    if (!name || !value) {
      return false
    }
    return (
      name.toLowerCase() === 'content-type' &&
      value.toLowerCase().includes('application/json')
    )
  })
}

/**
 * Gets proxy data and dedupes json string paths
 * @param requests
 */
export function extractUniqueJsonPaths(requests: ProxyData[]): {
  requestJsonPaths: string[]
  responseJsonPaths: string[]
} {
  const requestJsonPaths = new Set<string>()
  const responseJsonPaths = new Set<string>()

  for (const proxy of requests) {
    proxy.request?.jsonPaths?.forEach((path) => requestJsonPaths.add(path))
    proxy.response?.jsonPaths?.forEach((path) => responseJsonPaths.add(path))
  }

  return {
    requestJsonPaths: Array.from(requestJsonPaths),
    responseJsonPaths: Array.from(responseJsonPaths),
  }
}

type OnDotParts = {
  base: string
  baseLower: string
  currentLower: string
}

function shouldUseIndexDb(options: string[]) {
  return (options?.length ?? 0) >= indexThreshold
}

function normalizeQuery(query: string) {
  return query ?? ''
}

function ensureIndexDbWarm(recordingId: string, options: string[]) {
  if (shouldUseIndexDb(options)) {
    maybeBuildRecordingIndex(recordingId, options)
  }
}

function parseOnDotQuery(query: string): OnDotParts {
  const dotIndex = query.indexOf('.')

  if (dotIndex === -1) {
    const currentLower = query.toLowerCase()
    return { base: '', baseLower: '', currentLower }
  }

  const base = query.slice(0, dotIndex + 1)
  const current = query.slice(dotIndex + 1)

  return {
    base,
    baseLower: base.toLowerCase(),
    currentLower: current.toLowerCase(),
  }
}

function filterPrefixInMemory(query: string, options: string[]) {
  const q = query.toLowerCase()
  return options.filter((o) => o.toLowerCase().startsWith(q))
}

function filterOnDotInMemory(parts: OnDotParts, options: string[]) {
  const { base, currentLower } = parts

  return options.filter((o) => {
    if (!o.startsWith(base)) return false
    return o.slice(base.length).toLowerCase().startsWith(currentLower)
  })
}

async function filterPrefixWithIndexDb(
  recordingId: string,
  queryLower: string
) {
  return queryByFullPrefix(recordingId, queryLower)
}

async function filterOnDotWithIndexDb(recordingId: string, parts: OnDotParts) {
  const { base, baseLower, currentLower } = parts

  const candidates = await queryByFullPrefix(recordingId, baseLower)

  return candidates.filter((o) =>
    o.slice(base.length).toLowerCase().startsWith(currentLower)
  )
}

/**
 * Uses search query mode and returns list of json paths that match the query and search mode
 *
 * - onFirstKey: prefix match from the first character typed
 * - onThirdKey: prefix match once 3 characters have been typed (same matching, just different mode trigger)
 * - onDot: prefix match relative to the first dot in the query (e.g. "pizza.us" -> base "pizza." current "us")
 */
export async function queryStaticJsonPaths(
  recordingId: string,
  query: string,
  mode: SuggestionMode,
  options: string[]
) {
  const normalizedQuery = normalizeQuery(query)
  const useIndexDb = shouldUseIndexDb(options)

  if (useIndexDb) {
    ensureIndexDbWarm(recordingId, options)
  }

  if (mode === 'onDot') {
    const parts = parseOnDotQuery(normalizedQuery)
    return useIndexDb
      ? filterOnDotWithIndexDb(recordingId, parts)
      : filterOnDotInMemory(parts, options)
  }

  const queryLower = normalizedQuery.toLowerCase()

  return useIndexDb
    ? filterPrefixWithIndexDb(recordingId, queryLower)
    : filterPrefixInMemory(normalizedQuery, options)
}
