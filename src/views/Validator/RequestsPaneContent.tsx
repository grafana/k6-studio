import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { WebLogView } from '@/components/WebLogView'
import { GroupedProxyData } from '@/types'
import { useAutoScroll } from '@/hooks/useAutoScroll'

interface RequestPaneContentProps {
  requests: GroupedProxyData
}

export function RequestPaneContent({ requests }: RequestPaneContentProps) {
  const ref = useAutoScroll(requests)

  return (
    <Flex maxHeight="100%" direction="column" p="2">
      <Heading size="2" mb="2">
        Requests
      </Heading>
      <ScrollArea scrollbars="vertical">
        <div ref={ref}>
          <WebLogView requests={requests} />
        </div>
      </ScrollArea>
    </Flex>
  )
}
