import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { GroupedProxyData } from '@/types'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

interface RequestsSectionProps {
  groupedProxyData: GroupedProxyData
  autoScroll?: boolean
  noRequestsMessage?: string
}

export function RequestsSection({
  groupedProxyData,
  noRequestsMessage,
  autoScroll = false,
}: RequestsSectionProps) {
  const ref = useAutoScroll(groupedProxyData, autoScroll)

  return (
    <Flex direction="column" p="2" minHeight="0">
      <Heading size="2" mb="2">
        Requests
      </Heading>
      <ScrollArea scrollbars="vertical">
        <div ref={ref}>
          <WebLogView
            requests={groupedProxyData}
            noRequestsMessage={noRequestsMessage}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
