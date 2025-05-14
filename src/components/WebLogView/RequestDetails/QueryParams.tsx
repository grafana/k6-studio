import { DataList, Flex } from '@radix-ui/themes'

import { HighlightedText } from '@/components/HighlightedText'
import { Request } from '@/types'
import { Match } from '@/types/fuse'

export function QueryParams({
  request,
  matches,
}: {
  request: Request
  matches?: Match[]
}) {
  if (request.query.length === 0) {
    return (
      <Flex height="100%" justify="center" align="center">
        No query parameters
      </Flex>
    )
  }
  return (
    <DataList.Root size="1" trim="both">
      {request.query.map(([key, value]) => (
        <DataList.Item key={key}>
          <DataList.Label>
            <HighlightedText text={key} matches={matches} highlightAllMatches />
          </DataList.Label>
          <DataList.Value>
            <HighlightedText
              text={value}
              matches={matches}
              highlightAllMatches
            />
          </DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
