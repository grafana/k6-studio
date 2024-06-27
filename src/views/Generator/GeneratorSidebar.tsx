import { WebLogView } from '@/components/WebLogView'
import { GroupedProxyData } from '@/types'
import { Flex, ScrollArea } from '@radix-ui/themes'

interface GeneratorSidebarProps {
  requests: GroupedProxyData
}

export function GeneratorSidebar({ requests }: GeneratorSidebarProps) {
  return (
    <Flex direction="column" height="100%" minHeight="0" p="2">
      Requests:
      <ScrollArea scrollbars="vertical">
        <WebLogView requests={requests} />
      </ScrollArea>
    </Flex>
  )
}
