import { Button, Flex, Strong, Text } from '@radix-ui/themes'
import { Header, ProxyDataWithMatches } from '@/types'
import { Table } from '@/components/Table'
import { SearchMatch } from '@/types/fuse'
import { useMemo, useState } from 'react'

const PREVIEWABLE_MATCH_KEYS = [
  'request.content',
  'request.headers.key',
  'request.headers.value',
  'response.content',
  'response.headers.key',
  'response.headers.value',
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
export function SearchResults({ data }: { data: ProxyDataWithMatches }) {
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
  console.log('results', results)

  const visibleResults = useMemo(
    () => (showAll ? results : results.slice(0, resultsInPreview)),
    [results, showAll]
  )

  if (results.length === 0) {
    return null
  }

  const shouldShowShowMore = results.length > resultsInPreview

  return (
    <Table.Row>
      <Table.Cell colSpan={4}>
        {visibleResults.map((result, excerptIndex) => (
          <Flex key={excerptIndex}>
            {/* <Strong>{excerptIndex + 1}</Strong>:{' '}  */}
            {result.match.key?.includes('content') && (
              <ContentResult segment={result.segment} />
            )}
            {result.match.key?.includes('headers') && (
              <HeaderResult result={result} data={data} />
            )}
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

function HeaderResult({
  result,
  data,
}: {
  result: Result
  data: ProxyDataWithMatches
}) {
  const headers = result.match.key?.includes('request.headers')
    ? data.request.headers
    : data.response?.headers

  const isHeaderKeyMatch = result.match.key?.includes('headers.key')
  const isHeaderValueMatch = !isHeaderKeyMatch

  return (
    <>
      {isHeaderValueMatch && (
        <Strong>{findHeaderByKey(headers, result.match.value)}: </Strong>
      )}

      <Flex
        css={{
          fontWeight: isHeaderKeyMatch ? 'bold' : 'normal',
        }}
      >
        <ContentResult segment={result.segment} />
      </Flex>
      {isHeaderKeyMatch && (
        <Text truncate>: {findHeaderByValue(headers, result.match.value)}</Text>
      )}
    </>
  )
}

function ContentResult({ segment }: { segment: Segment }) {
  return (
    <>
      {/* Show ellipsis on the left side: wrapped ltr inside rtl is needed */}
      {/* to prevent swapping sides of punctuation marks */}
      {segment.beforeMatch.length > 0 && (
        <Text css={{ maxWidth: '20%', flexShrink: 1 }} dir="rtl" truncate>
          <Text dir="ltr">{segment.beforeMatch}</Text>
        </Text>
      )}

      <mark css={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{segment.match}</mark>
      <Text css={{ flexGrow: 1 }} truncate>
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
    beforeMatch,
    match,
    afterMatch,
  }
}

function findHeaderByKey(
  headers: Header[] | undefined,
  value: string | undefined
) {
  if (!headers || !value) {
    return
  }

  return headers.find(([_, headerValue]) => headerValue === value)?.[0]
}

function findHeaderByValue(
  headers: Header[] | undefined,
  key: string | undefined
) {
  if (!headers || !key) {
    return
  }

  return headers.find(([headerKey]) => headerKey === key)?.[1]
}
