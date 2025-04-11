import { diffWords } from 'diff'

import { Header, ProxyDataWithMatches } from '@/types'
import { SearchMatch } from '@/types/fuse'
import { diffChangesToFuseIndices } from '@/utils/diff'

import { useRequestSnapshot } from './useRequestSnapshot'

export function useHighlightRequestChanges(
  data: ProxyDataWithMatches | null
): ProxyDataWithMatches | null {
  const originalRequest = useRequestSnapshot(data?.id)

  // Don't overwrite search matches when present
  if (data?.matches && data?.matches.length > 0) {
    return data
  }

  const modified = data?.request

  if (!originalRequest || !modified) {
    return data
  }

  const requestHeaderMatches = getHeaderMatches(
    originalRequest.headers,
    modified.headers,
    'request.headers'
  )

  const urlMatches = getDiffHighlights(
    originalRequest.url,
    modified.url,
    'request.url'
  )

  return {
    ...data,
    matches: [...requestHeaderMatches, urlMatches],
  }
}

// TODO: naming
function getDiffHighlights(original: string, modified: string, key: string) {
  const diff = diffWords(original, modified)

  return {
    indices: diffChangesToFuseIndices(diff),
    value: modified,
    color: 'green',
    key,
  }
}

// TODO: naming
function getHeaderMatches(
  originalHeaders: Header[],
  headers: Header[],
  key: string
) {
  return headers.map((header, index): SearchMatch => {
    const originalValue = originalHeaders[index]?.[1]
    const value = header[1]

    return getDiffHighlights(originalValue ?? '', value, key)
  })
}
