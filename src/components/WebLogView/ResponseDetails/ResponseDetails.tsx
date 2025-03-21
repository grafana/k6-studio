import { Box } from '@radix-ui/themes'
import { useEffect, useMemo } from 'react'

import { ProxyDataWithMatches } from '@/types'

import { Cookies } from '../Cookies'
import { useResponseDetailsTab } from '../Details.hooks'
import { Tabs } from '../Tabs'

import { Content } from './Content'
import { Headers } from './Headers'

interface ResponseDetailsProps {
  data: ProxyDataWithMatches
}

export function ResponseDetails({ data }: ResponseDetailsProps) {
  const { tab, setTab } = useResponseDetailsTab()

  // Reset tab when closing details
  useEffect(() => {
    return () => setTab('headers')
  }, [setTab])

  const responseMatches = useMemo(
    () => data?.matches?.filter((match) => match?.key?.startsWith('response.')),
    [data.matches]
  )

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        <Tabs.Trigger value="content">Content</Tabs.Trigger>
        <Tabs.Trigger value="cookies">Cookies</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="headers">
        <Box p="2" height="100%">
          <Headers data={data} matches={responseMatches} />
        </Box>
      </Tabs.Content>
      <Tabs.Content value="content">
        <Content data={data} />
      </Tabs.Content>
      <Tabs.Content value="cookies">
        <Box p="2" height="100%">
          <Cookies cookies={data.response?.cookies} matches={responseMatches} />
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  )
}
