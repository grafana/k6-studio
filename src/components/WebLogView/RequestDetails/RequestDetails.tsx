import { Box } from '@radix-ui/themes'
import { useEffect, useMemo } from 'react'

import { ProxyDataWithMatches } from '@/types'

import { Cookies } from '../Cookies'
import { useRequestDetailsTab } from '../Details.hooks'
import { Tabs } from '../Tabs'

import { Headers } from './Headers'
import { Payload } from './Payload'
import { QueryParams } from './QueryParams'

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

  const requestMatches = useMemo(
    () => data?.matches?.filter((match) => match?.key?.startsWith('request.')),
    [data.matches]
  )

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
          <Headers data={data} matches={requestMatches} />
        </Box>
      </Tabs.Content>

      <Tabs.Content value="payload">
        <Payload data={data} />
      </Tabs.Content>

      <Tabs.Content value="cookies">
        <Box p="2" height="100%">
          <Cookies cookies={data.request?.cookies} matches={requestMatches} />
        </Box>
      </Tabs.Content>

      <Tabs.Content value="queryParams">
        <Box p="2" height="100%">
          <QueryParams request={data.request} matches={requestMatches} />
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  )
}
