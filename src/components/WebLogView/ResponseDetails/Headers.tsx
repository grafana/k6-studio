import { ProxyData } from '@/types'
import { DataList, Strong } from '@radix-ui/themes'

export function Headers({ data }: { data: ProxyData }) {
  const headers = data.response?.headers ?? []

  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Status Code</DataList.Label>
        <DataList.Value>{data.response?.statusCode}</DataList.Value>
      </DataList.Item>

      {headers.map(([key, value], index) => (
        <DataList.Item key={`${key}_${index}`}>
          <DataList.Label>{key}</DataList.Label>
          <DataList.Value>{value}</DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
