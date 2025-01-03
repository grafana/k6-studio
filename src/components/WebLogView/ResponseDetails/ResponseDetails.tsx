import { Box, ScrollArea } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { Tabs } from '../Tabs'
import { Headers } from './Headers'
import { Content } from './Content'
import { Cookies } from '../Cookies'
import { useEffect, useState } from 'react'

interface ResponseDetailsProps {
  data: ProxyData
  tab?: string
}

export function ResponseDetails({ data, tab }: ResponseDetailsProps) {
  const [selectedTab, setSelectedTab] = useState(tab ?? 'headers')

  // Allow changing the tab using props
  useEffect(() => {
    tab && setSelectedTab(tab)
  }, [tab])

  return (
    <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
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
          <Cookies cookies={data.response?.cookies} />
        </ScrollArea>
      </Tabs.Content>
    </Tabs.Root>
  )
}
