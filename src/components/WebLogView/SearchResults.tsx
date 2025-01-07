import { Button, Flex, Strong, Text } from '@radix-ui/themes'
import { ProxyDataWithMatches } from '@/types'
import { Table } from '@/components/Table'
import { SearchMatch } from '@/types/fuse'
import { useMemo, useState } from 'react'
import { HighlightMark } from '../HighlightedText'
import { useRequestDetailsTab, useResponseDetailsTab } from './Details.hooks'

const PREVIEWABLE_MATCH_KEYS = [
  'request.content',
  'request.headers.key',
  'request.headers.value',
  'request.cookies',
  'request.query',
  'request.headers',
  'response.cookies',
  'response.headers',
  'response.content',
]

interface Result {
  segment: Segment
  match: SearchMatch
}

// TODO:
// - JSON matches
// - HTML matches
// - Header matches (including cookies)
// TODO: better name for excerpt?
export function SearchResults({
  data,
  onSelectRequest,
}: {
  data: ProxyDataWithMatches
  onSelectRequest: (data: ProxyDataWithMatches) => void
}) {
  const { setTab: setRequestTab } = useRequestDetailsTab()
  const { setTab: setResponseTab } = useResponseDetailsTab()
  const resultsInPreview = 10
  const [showAll, setShowAll] = useState(false)
  const toggleShowAll = () => setShowAll((prev) => !prev)

  const { matches } = data

  const results = useMemo(() => {
    if (!matches) {
      return []
    }

    // Exclude matches that are displayed in table row
    const previewableMatches = matches.filter((match) =>
      PREVIEWABLE_MATCH_KEYS.includes(match.key ?? '')
    )

    return previewableMatches.flatMap((match) => {
      const segments = match.indices.map((index) =>
        getSegments(match.value ?? '', index)
      )
      return segments.map((segment) => ({
        segment,
        match,
      }))
    })
  }, [matches])

  const visibleResults = useMemo(
    () => (showAll ? results : results.slice(0, resultsInPreview)),
    [results, showAll]
  )

  function handleResultClick(result: Result, data: ProxyDataWithMatches) {
    onSelectRequest(data)
    console.log('key', result.match.key)

    // Request match
    if (result.match.key?.includes('request.content')) {
      return setRequestTab('payload')
    }

    if (result.match.key?.includes('request.headers')) {
      return setRequestTab('headers')
    }

    if (result.match.key?.includes('request.cookies')) {
      return setRequestTab('cookies')
    }

    if (result.match.key?.includes('request.query')) {
      return setRequestTab('queryParams')
    }

    // Response match
    if (result.match.key?.includes('response.content')) {
      return setResponseTab('content')
    }

    if (result.match.key?.includes('response.headers')) {
      return setResponseTab('headers')
    }

    if (result.match.key?.includes('response.cookies')) {
      return setResponseTab('cookies')
    }
  }

  if (results.length === 0) {
    return null
  }

  const shouldShowShowMore = results.length > resultsInPreview

  return (
    <Table.Row>
      <Table.Cell colSpan={5}>
        {visibleResults.map((result, excerptIndex) => (
          <Flex
            key={excerptIndex}
            css={{ fontSize: 'var(--font-size-1)' }}
            onClick={() => {
              handleResultClick(result, data)
            }}
          >
            <Strong css={{ flexShrink: 0 }}>
              {getMatchType(result.match.key)}:&nbsp;
            </Strong>
            <ContentResult segment={result.segment} />
          </Flex>
        ))}
        {shouldShowShowMore && (
          <Button size="1" variant="outline" onClick={toggleShowAll} my="2">
            {showAll
              ? 'Show less'
              : `Show ${results.length - resultsInPreview} more`}
          </Button>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

function getMatchType(key?: string) {
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

function ContentResult({ segment }: { segment: Segment }) {
  return (
    <>
      {/* Show ellipsis on the left side: wrapped ltr inside rtl is needed */}
      {/* to prevent swapping sides of punctuation marks */}
      {segment.beforeMatch.length > 0 && (
        <Text css={{ flexShrink: 1, whiteSpace: 'pre' }} dir="rtl" truncate>
          <Text dir="ltr" css={{ whiteSpace: 'pre' }}>
            {segment.beforeMatch}
            {/* Preserve trailing space, gets removed by rtl */}
            {stringEndsWithSpace(segment.beforeMatch) && <>&nbsp;</>}
          </Text>
        </Text>
      )}

      <HighlightMark
        css={{
          flexShrink: 0,
          whiteSpace: 'pre',
          lineHeight: 'var(--default-line-height)',
        }}
      >
        {segment.match}
      </HighlightMark>
      <Text css={{ flexGrow: 1, whiteSpace: 'pre' }} truncate>
        {segment.afterMatch}
      </Text>
    </>
  )
}

type Segment = ReturnType<typeof getSegments>

function getSegments(text: string, index: SearchMatch['indices'][number]) {
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

function stringEndsWithSpace(str: string) {
  return str[str.length - 1] === ' '
}
