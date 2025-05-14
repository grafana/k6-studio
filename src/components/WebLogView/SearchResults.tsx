import { Button, Flex, Strong, Text } from '@radix-ui/themes'
import { useMemo, useState } from 'react'

import { Table } from '@/components/Table'
import { ProxyDataWithMatches } from '@/types'
import { Match } from '@/types/fuse'

import { HighlightMark } from '../HighlightedText'

import {
  useGoToContentMatch,
  useGoToPayloadMatch,
  useRequestDetailsTab,
  useResponseDetailsTab,
} from './Details.hooks'
import {
  addSegmentsToMatches,
  getMatchType,
  highlightResult,
  Segment,
  stringEndsWithSpace,
} from './SearchResults.utils'

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
  match: Match
}

export function SearchResults({
  data,
  onSelectRequest,
  filter,
}: {
  data: ProxyDataWithMatches
  onSelectRequest: (data: ProxyDataWithMatches) => void
  filter?: string
}) {
  const { setTab: setRequestTab } = useRequestDetailsTab()
  const { setTab: setResponseTab } = useResponseDetailsTab()

  const { goToMatch: goToContentMatch } = useGoToContentMatch()
  const { goToMatch: goToPayloadMatch } = useGoToPayloadMatch()

  const [showAll, setShowAll] = useState(false)

  const resultsInPreview = 10

  const toggleShowAll = () => setShowAll((prev) => !prev)

  const { matches } = data

  // Exclude fields that are already displayed in table row
  const previewableMatches = useMemo(
    () =>
      (matches ?? []).filter((match) =>
        PREVIEWABLE_MATCH_KEYS.includes(match.key ?? '')
      ),
    [matches]
  )

  const results = useMemo(
    () => addSegmentsToMatches(previewableMatches),
    [previewableMatches]
  )

  const visibleResults = useMemo(
    () => (showAll ? results : results.slice(0, resultsInPreview)),
    [results, showAll]
  )

  function handleResultClick(
    result: Result,
    data: ProxyDataWithMatches,
    searchIndex: number
  ) {
    onSelectRequest(data)

    highlightResult({
      matchKey: result.match.key,
      setRequestTab,
      setResponseTab,
      goToPayloadMatch,
      goToContentMatch,
      filter,
      searchIndex,
    })
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
            css={{
              fontSize: 'var(--font-size-1)',
              cursor: 'var(--cursor-button)',
              '&:hover': {
                backgroundColor: 'var(--accent-3)',
              },
            }}
            onClick={() => {
              handleResultClick(result, data, result.index)
            }}
          >
            <Strong css={{ flexShrink: 0 }}>
              {getMatchType(result.match.key)}:&nbsp;
            </Strong>
            <ResultContent segment={result.segment} />
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

function ResultContent({ segment }: { segment: Segment }) {
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
