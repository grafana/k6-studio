import { ProxyData } from '@/types'
import { Box, ScrollArea, Tabs } from '@radix-ui/themes'
import { Headers } from './Headers'
import { Response } from './Response'

export function RequestDetails({ data }: { data: ProxyData }) {
  return (
    <Tabs.Root defaultValue="response" style={{ height: '100%' }}>
      <Tabs.List>
        <Tabs.Trigger value="response">Response</Tabs.Trigger>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
      </Tabs.List>

      <ScrollArea>
        <Box p="2" pb="8" width="100%">
          <Tabs.Content value="response">
            <Response data={data} />
          </Tabs.Content>
          <Tabs.Content value="headers">
            <Headers data={data} />
          </Tabs.Content>
        </Box>
      </ScrollArea>
    </Tabs.Root>
  )
}
