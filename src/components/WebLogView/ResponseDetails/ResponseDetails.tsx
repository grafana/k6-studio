import { Box, ScrollArea } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { Tabs } from '../Tabs'
import { Headers } from './Headers'
import { Content } from './Content'
import { Cookies } from '../Cookies'

export function ResponseDetails({ data }: { data: ProxyData }) {
  return (
    <Tabs.Root defaultValue="headers">
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
