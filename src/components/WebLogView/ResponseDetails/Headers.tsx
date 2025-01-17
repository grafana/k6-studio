import { HighlightedText } from '@/components/HighlightedText'
import { ProxyDataWithMatches } from '@/types'
import { DataList, Strong } from '@radix-ui/themes'

export function Headers({ data }: { data: ProxyDataWithMatches }) {
  const headers = data.response?.headers ?? []

  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Status code</DataList.Label>
        <DataList.Value>{data.response?.statusCode}</DataList.Value>
      </DataList.Item>

      {headers.map(([key, value], index) => (
        <DataList.Item key={`${key}_${index}`}>
          <DataList.Label>
            <HighlightedText
              text={key}
              matches={data.matches}
              highlightAllMatches
            />
          </DataList.Label>
          <DataList.Value>
            <HighlightedText
              text={value}
              matches={data.matches}
              highlightAllMatches
            />
          </DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
