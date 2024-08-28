import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { useState } from 'react'
import { ClearRequestsButton } from './ClearRequestsButton'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  selectedRequestId?: string
  autoScroll?: boolean
  noRequestsMessage?: string
  onSelectRequest: (data: ProxyData | null) => void
  resetProxyData?: () => void
}

export function RequestsSection({
  proxyData,
  selectedRequestId,
  noRequestsMessage,
  autoScroll = false,
  onSelectRequest,
  resetProxyData,
}: RequestsSectionProps) {
  const [filteredProxyData, setFilterdedProxyData] = useState<ProxyData[]>([])
  const groupedProxyData = groupProxyData(filteredProxyData)
  const ref = useAutoScroll(groupedProxyData, autoScroll)

  return (
    <Flex direction="column" minHeight="0" height="100%">
      <Flex justify="between" pr="2">
        <Flex align="center">
          <Heading
            css={css`
              font-size: 15px;
              line-height: 24px;
              font-weight: 500;
              padding: var(--space-2);
            `}
          >
            Requests ({filteredProxyData.length})
          </Heading>
          {resetProxyData && (
            <ClearRequestsButton
              handleConfirm={resetProxyData}
              disabled={proxyData.length === 0}
            />
          )}
        </Flex>

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
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
