import { diffWords } from 'diff'

import { Header, ProxyDataWithMatches } from '@/types'
import { SearchMatch } from '@/types/fuse'
import { RuleInstance } from '@/types/rules'
import { diffChangesToFuseIndices } from '@/utils/diff'

import { selectFilteredRequests, useGeneratorStore } from '..'

export function useHighlightRequestChanges(
  requests: ProxyDataWithMatches[],
  selectedRuleInstance: RuleInstance | undefined
): ProxyDataWithMatches[] {
  const originalRequests = useGeneratorStore(selectFilteredRequests)

  // TODO: refactor, useRequestSnapshot has similar logic
  function getOriginalRequest(id: string) {
    if (
      selectedRuleInstance &&
      'requestsReplaced' in selectedRuleInstance.state
    ) {
      return selectedRuleInstance?.state.requestsReplaced.find(
        (request) => request.id === id
      )?.original
    }
    return originalRequests.find((request) => request.id === id)?.request
  }

  return requests.map((data) => {
    const originalRequest = getOriginalRequest(data.id)

    if (!originalRequest) {
      return data
    }

    return addHighlights(originalRequest, data)
  })
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

  const requestHeaderMatches = getHeaderHighlights(
    originalRequest.headers,
    modified.headers,
    'request.header.value'
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
    matches: [...requestHeaderMatches, urlMatches, pathMatches, hostMatches],
  }
}

function getStringHighlights(original: string, modified: string, key: string) {
  const diff = diffWords(original, modified)

  return {
    indices: diffChangesToFuseIndices(diff),
    value: modified,
    color: 'green',
    key,
  }
}

function getHeaderHighlights(
  originalHeaders: Header[],
  headers: Header[],
  key: string
) {
  return headers.map((header, index): SearchMatch => {
    const originalValue = originalHeaders[index]?.[1]
    const value = header[1]

    return getStringHighlights(originalValue ?? '', value, key)
  })
}
