import { Box, ScrollArea } from '@radix-ui/themes'

import { ProxyDataWithMatches } from '@/types'
import { Tabs } from '../Tabs'
import { Headers } from './Headers'
import { Content } from './Content'
import { Cookies } from '../Cookies'
import { useEffect } from 'react'
import { useResponseDetailsTab } from '../Details.hooks'

interface ResponseDetailsProps {
  data: ProxyDataWithMatches
}

export function ResponseDetails({ data }: ResponseDetailsProps) {
  const { tab, setTab } = useResponseDetailsTab()

  // Reset tab when closing details
  useEffect(() => {
    return () => setTab('headers')
  }, [setTab])

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        <Tabs.Trigger value="content">Content</Tabs.Trigger>
        <Tabs.Trigger value="cookies">Cookies</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="headers">
        <ScrollArea style={{ height: '100%' }}>
          <Box p="2" height="100%">
            <Headers data={data} />
          </Box>
        </ScrollArea>
      </Tabs.Content>
      <Tabs.Content value="content">
        <Content data={data} />
      </Tabs.Content>
      <Tabs.Content value="cookies">
        <ScrollArea style={{ height: '100%' }}>
          <Cookies cookies={data.response?.cookies} matches={data.matches} />
        </ScrollArea>
      </Tabs.Content>
    </Tabs.Root>
  )
}
