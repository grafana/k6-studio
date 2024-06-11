import { ProxyData } from '@/types'
import { Box, Tabs } from '@radix-ui/themes'
import { Headers } from './Headers'
import { Response } from './Response'

export function RequestDetails({ data }: { data: ProxyData }) {
  return (
    <Tabs.Root defaultValue="response">
      <Tabs.List>
        <Tabs.Trigger value="response">Response</Tabs.Trigger>
        <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
      </Tabs.List>
      <Box pt="3" pb="4">
        <Tabs.Content value="response">
          <Response data={data} />
        </Tabs.Content>
        <Tabs.Content value="headers">
          <Headers data={data} />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  )
}
