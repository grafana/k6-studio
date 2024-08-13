import { ComponentProps } from 'react'
import { Box, ScrollArea } from '@radix-ui/themes'

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

      <ScrollableTabsContent value="headers">
        <Headers data={data} />
      </ScrollableTabsContent>

      <ScrollableTabsContent value="payload">
        <Payload data={data} />
      </ScrollableTabsContent>

      <ScrollableTabsContent value="cookies">
        <Cookies cookies={data.request?.cookies} />
      </ScrollableTabsContent>

      <ScrollableTabsContent value="queryParams">
        <QueryParams request={data.request} />
      </ScrollableTabsContent>
    </Tabs.Root>
  )
}

const ScrollableTabsContent = ({
  children,
  value,
  ...props
}: ComponentProps<typeof Tabs.Content>) => {
  return (
    <Tabs.Content value={value} {...props}>
      <ScrollArea style={{ height: '100%' }}>
        <Box p="4" height="100%">
          {children}
        </Box>
      </ScrollArea>
    </Tabs.Content>
  )
}
