import { WebLogView } from '@/components/WebLogView'
import { GroupedProxyData } from '@/types'
import { Box, Flex, ScrollArea, Tabs } from '@radix-ui/themes'
import { ScriptPreview } from './ScriptPreview'

interface GeneratorSidebarProps {
  requests: GroupedProxyData
}

export function GeneratorSidebar({ requests }: GeneratorSidebarProps) {
  return (
    <Flex direction="column" height="100%" minHeight="0">
      <Tabs.Root
        defaultValue="requests"
        style={{
          height: '100%',
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="requests">Requests</Tabs.Trigger>
          <Tabs.Trigger value="script">Script</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="requests"
          style={{
            height: '100%',
          }}
        >
          <ScrollArea scrollbars="vertical">
            <Box p="2">
              <WebLogView requests={requests} />
            </Box>
          </ScrollArea>
        </Tabs.Content>
        <Tabs.Content value="script">
          <ScriptPreview />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
