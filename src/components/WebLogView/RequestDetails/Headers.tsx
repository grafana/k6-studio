import { ProxyData } from '@/types'
import { DataList, Strong } from '@radix-ui/themes'

export function Headers({ data }: { data: ProxyData }) {
  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Request URL</DataList.Label>
        <DataList.Value>{data.request.url}</DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>Request Method</DataList.Label>
        <DataList.Value>{data.request.method}</DataList.Value>
      </DataList.Item>

      {data.request.headers.map(([key, value], index) => (
        <DataList.Item key={`${key}_${index}`}>
          <DataList.Label>{key}</DataList.Label>
          <DataList.Value>{value}</DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
