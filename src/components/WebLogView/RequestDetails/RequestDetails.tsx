import { ProxyDataWithMatches } from '@/types'

import { Tabs } from '../Tabs'
import { Cookies } from '../Cookies'
import { Headers } from './Headers'
import { Payload } from './Payload'
import { QueryParams } from './QueryParams'
import { Box } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

interface RequestDetailsProps {
  data: ProxyDataWithMatches
  tab?: string
}

export function RequestDetails({ data, tab }: RequestDetailsProps) {
  const [selectedTab, setSelectedTab] = useState(tab ?? 'headers')

  // Allow changing the tab using props
  useEffect(() => {
    tab && setSelectedTab(tab)
  }, [tab])

  return (
    <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
      <Tabs.List>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        <Tabs.Trigger value="payload">Payload</Tabs.Trigger>
        <Tabs.Trigger value="cookies">Cookies</Tabs.Trigger>
        {data.request?.query && data.request.query.length > 0 && (
          <Tabs.Trigger value="queryParams">Query parameters</Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="headers">
        <Box p="2" height="100%">
          <Headers data={data} />
        </Box>
      </Tabs.Content>

      <Tabs.Content value="payload">
        <Payload data={data} />
      </Tabs.Content>

      <Tabs.Content value="cookies">
        <Cookies cookies={data.request?.cookies} matches={data.matches} />
      </Tabs.Content>

      <Tabs.Content value="queryParams">
        <QueryParams request={data.request} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
