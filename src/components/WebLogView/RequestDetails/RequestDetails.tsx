import { ProxyDataWithMatches } from '@/types'

import { Tabs } from '../Tabs'
import { Cookies } from '../Cookies'
import { Headers } from './Headers'
import { Payload } from './Payload'
import { QueryParams } from './QueryParams'
import { Box } from '@radix-ui/themes'
import { useEffect } from 'react'
import { useRequestDetailsTab } from '../Details.hooks'

interface RequestDetailsProps {
  data: ProxyDataWithMatches
}

export function RequestDetails({ data }: RequestDetailsProps) {
  const { tab, setTab } = useRequestDetailsTab()

  const isQueryParamsAvailable =
    data.request?.query && data.request.query.length > 0

  // Reset tab when closing details
  useEffect(() => {
    return () => setTab('headers')
  }, [setTab])

  // Reset to headers tab if query params are not available
  useEffect(() => {
    if (tab === 'queryParams' && !isQueryParamsAvailable) {
      setTab('headers')
    }
  }, [tab, isQueryParamsAvailable, setTab])

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        <Tabs.Trigger value="payload">Payload</Tabs.Trigger>
        <Tabs.Trigger value="cookies">Cookies</Tabs.Trigger>
        {isQueryParamsAvailable && (
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
        <QueryParams request={data.request} matches={data.matches} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
