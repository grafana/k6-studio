import { Match } from '@/types/fuse'

export function getMatchType(key?: string) {
  if (key?.includes('headers')) {
    return 'Header'
  }

  if (key?.includes('cookies')) {
    return 'Cookie'
  }

  if (key?.includes('request.query')) {
    return 'Query'
  }

  return 'Body'
}

export function stringEndsWithSpace(str: string) {
  return str[str.length - 1] === ' '
}

export function addSegmentsToMatches(matches: Match[]) {
  return matches.flatMap((match) => {
    const segments = match.indices.map((indices, index) => ({
      segment: getSegments(match.value ?? '', indices),
      index,
    }))

    return segments.map(({ segment, index }) => ({
      segment,
      match,
      index,
    }))
  })
}

export function highlightResult({
  matchKey,
  setRequestTab,
  setResponseTab,
  goToPayloadMatch,
  goToContentMatch,
  filter,
  searchIndex,
}: {
  matchKey?: string
  setRequestTab: (tab: string) => void
  setResponseTab: (tab: string) => void
  goToPayloadMatch: (args: { searchString?: string; index: number }) => void
  goToContentMatch: (args: { searchString?: string; index: number }) => void
  filter?: string
  searchIndex: number
}) {
  // Request match
  if (matchKey?.includes('request.content')) {
    setRequestTab('payload')
    return goToPayloadMatch({ searchString: filter, index: searchIndex })
  }

  if (matchKey?.includes('request.headers')) {
    return setRequestTab('headers')
  }

  if (matchKey?.includes('request.cookies')) {
    return setRequestTab('cookies')
  }

  if (matchKey?.includes('request.query')) {
    return setRequestTab('queryParams')
  }

  // Response match
  if (matchKey?.includes('response.content')) {
    setResponseTab('content')
    return goToContentMatch({ searchString: filter, index: searchIndex })
  }

  if (matchKey?.includes('response.headers')) {
    return setResponseTab('headers')
  }

  if (matchKey?.includes('response.cookies')) {
    return setResponseTab('cookies')
  }
}

export function getSegments(text: string, index: Match['indices'][number]) {
  const lengthBeforeMatch = 800
  // Avoid adding long response bodies into dom
  const lengthAfterMatch = 800
  const [start, end] = index

  const startOffset = Math.max(0, start - lengthBeforeMatch)
  const beforeMatch = text.slice(startOffset, start)

  const match = text.slice(start, end + 1)
  const afterMatch = text.slice(end + 1, end + lengthAfterMatch)

  return {
    beforeMatch: beforeMatch.replace(/\n/g, ''),
    match,
    afterMatch: afterMatch.replace(/\n/g, ''),
  }
}

export type Segment = ReturnType<typeof getSegments>
