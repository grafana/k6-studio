import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { useState } from 'react'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  autoScroll?: boolean
  noRequestsMessage?: string
}

export function RequestsSection({
  proxyData,
  noRequestsMessage,
  autoScroll = false,
}: RequestsSectionProps) {
  const [filteredProxyData, setFilterdedProxyData] = useState<ProxyData[]>([])
  const groupedProxyData = groupProxyData(filteredProxyData)
  const ref = useAutoScroll(groupedProxyData, autoScroll)

  return (
    <Flex direction="column" p="2" minHeight="0">
      <Flex justify="between">
        <Heading size="2" mb="2">
          Requests
        </Heading>

        <StaticAssetsFilter
          proxyData={proxyData}
          setFilteredProxyData={setFilterdedProxyData}
        />
      </Flex>

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
