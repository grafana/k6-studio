import { diffWords } from 'diff'
import { useMemo } from 'react'

import { KeyValueTuple, ProxyDataWithMatches } from '@/types'
import { Match } from '@/types/fuse'
import { diffChangesToFuseIndices } from '@/utils/diff'

import { selectFilteredRequests, useGeneratorStore } from '..'

export function useHighlightRequestChanges(
  requests: ProxyDataWithMatches[]
): ProxyDataWithMatches[] {
  const originalRequests = useGeneratorStore(selectFilteredRequests)

  return useMemo(() => {
    return requests.map((data) => {
      const originalRequest = originalRequests.find(
        (request) => request.id === data.id
      )?.request

      if (!originalRequest) {
        return data
      }

      return addHighlights(originalRequest, data)
    })
  }, [requests, originalRequests])
}

function addHighlights(
  originalRequest: ProxyDataWithMatches['request'],
  data: ProxyDataWithMatches
) {
  // Don't overwrite search matches when present
  if (data?.matches && data?.matches.length > 0) {
    return data
  }

  const modified = data?.request

  if (!originalRequest || !modified) {
    return data
  }

  const requestHeaderMatches = getKeyValueTupleHighlights(
    originalRequest.headers,
    modified.headers,
    'request.header.value'
  )

  const requestCookieMatches = getKeyValueTupleHighlights(
    originalRequest.cookies,
    modified.cookies,
    'request.cookie.value'
  )

  const queryMatches = getKeyValueTupleHighlights(
    originalRequest.query,
    modified.query,
    'request.query.value'
  )

  const urlMatches = getStringHighlights(
    originalRequest.url,
    modified.url,
    'request.url'
  )

  const pathMatches = getStringHighlights(
    originalRequest.path,
    modified.path,
    'request.path'
  )

  const hostMatches = getStringHighlights(
    originalRequest.host,
    modified.host,
    'request.host'
  )

  return {
    ...data,
    matches: [
      ...requestHeaderMatches,
      ...requestCookieMatches,
      ...queryMatches,
      urlMatches,
      pathMatches,
      hostMatches,
    ],
  }
}

function getStringHighlights(
  original: string,
  modified: string,
  key: string
): Match {
  const diff = diffWords(original, modified)

  return {
    indices: diffChangesToFuseIndices(diff),
    value: modified,
    color: 'green',
    key,
  }
}

function getKeyValueTupleHighlights(
  originalValues: KeyValueTuple[],
  values: KeyValueTuple[],
  key: string
) {
  return values.map(([_, value], index): Match => {
    const originalValue = originalValues[index]?.[1]

    return getStringHighlights(originalValue ?? '', value, key)
  })
}
