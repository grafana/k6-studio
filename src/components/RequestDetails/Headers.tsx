import { ProxyData } from '@/types'
import { DataList, Strong } from '@radix-ui/themes'
import { requestToFullUrl } from './RequestDetails.utils'

export function Headers({ data }: { data: ProxyData }) {
  return (
    <DataList.Root size="1" trim="both">
      <Strong>General</Strong>
      <DataList.Item>
        <DataList.Label>Request URL</DataList.Label>
        <DataList.Value>{requestToFullUrl(data.request)}</DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>Request Method</DataList.Label>
        <DataList.Value>{data.request.method}</DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>Status Code</DataList.Label>
        <DataList.Value>{data.response?.statusCode}</DataList.Value>
      </DataList.Item>

      {data.response && (
        <>
          <Strong>Response headers</Strong>
          {data.response?.headers.map(([key, value], index) => (
            <DataList.Item key={`${key}_${index}`}>
              <DataList.Label>{key}</DataList.Label>
              <DataList.Value>{value}</DataList.Value>
            </DataList.Item>
          ))}
        </>
      )}

      <Strong>Request headers</Strong>
      {data.request.headers.map(([key, value], index) => (
        <DataList.Item key={`${key}_${index}`}>
          <DataList.Label>{key}</DataList.Label>
          <DataList.Value>{value}</DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
