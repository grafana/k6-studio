import { DataList, Strong } from '@radix-ui/themes'

import { HighlightedText } from '@/components/HighlightedText'
import { ProxyData } from '@/types'
import { SearchMatch } from '@/types/fuse'

export function Headers({
  data,
  matches,
}: {
  data: ProxyData
  matches?: SearchMatch[]
}) {
  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Request URL</DataList.Label>
        <DataList.Value>{data.request.url}</DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>Request method</DataList.Label>
        <DataList.Value>{data.request.method}</DataList.Value>
      </DataList.Item>

      {data.request.headers.map(([key, value], index) => (
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
