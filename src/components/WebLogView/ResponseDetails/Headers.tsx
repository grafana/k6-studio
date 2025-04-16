import { DataList, Strong } from '@radix-ui/themes'

import { HighlightedText } from '@/components/HighlightedText'
import { ProxyData } from '@/types'
import { Match } from '@/types/fuse'

export function Headers({
  data,
  matches,
}: {
  data: ProxyData
  matches?: Match[]
}) {
  const headers = data.response?.headers ?? []

  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Status code</DataList.Label>
        <DataList.Value>{data.response?.statusCode}</DataList.Value>
      </DataList.Item>

      <Strong>Headers</Strong>
      {headers.map(([key, value], index) => (
        <DataList.Item key={`${key}_${index}`}>
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
