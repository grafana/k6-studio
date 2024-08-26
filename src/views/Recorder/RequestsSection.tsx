import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
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
    <Flex direction="column" minHeight="0" height="100%">
      <Flex justify="between" pr="2">
        <Heading
          css={css`
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            padding: var(--space-2) var(--space-3);
          `}
        >
          Requests ({filteredProxyData.length})
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
