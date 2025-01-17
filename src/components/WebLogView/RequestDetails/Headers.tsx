import { HighlightedText } from '@/components/HighlightedText'
import { ProxyDataWithMatches } from '@/types'
import { DataList, Strong } from '@radix-ui/themes'

export function Headers({ data }: { data: ProxyDataWithMatches }) {
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
            <HighlightedText
              text={key}
              matches={data.matches}
              highlightAllMatches
            />
          </DataList.Label>
          <DataList.Value>
            <span>
              <HighlightedText
                text={value}
                matches={data.matches}
                highlightAllMatches
              />
            </span>
          </DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
