import { ProxyData } from '@/types'

import { Tabs } from '../Tabs'
import { Cookies } from '../Cookies'
import { Headers } from './Headers'
import { Payload } from './Payload'
import { QueryParams } from './QueryParams'

export function RequestDetails({ data }: { data: ProxyData }) {
  return (
    <Tabs.Root defaultValue="headers">
      <Tabs.List>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        <Tabs.Trigger value="payload">Payload</Tabs.Trigger>
        <Tabs.Trigger value="cookies">Cookies</Tabs.Trigger>
        {data.request?.query && data.request.query.length > 0 && (
          <Tabs.Trigger value="queryParams">Query parameters</Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="headers">
        <Headers data={data} />
      </Tabs.Content>

      <Tabs.Content value="payload">
        <Payload data={data} />
      </Tabs.Content>

      <Tabs.Content value="cookies">
        <Cookies cookies={data.request?.cookies} />
      </Tabs.Content>

      <Tabs.Content value="queryParams">
        <QueryParams request={data.request} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
