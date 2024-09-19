import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { Group, ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { useState, ReactNode } from 'react'
import { ClearRequestsButton } from './ClearRequestsButton'
import { NoRequestsMessage } from '@/components/NoRequestsMessage'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  groups?: Group[]
  selectedRequestId?: string
  autoScroll?: boolean
  activeGroup?: string
  noRequestsMessage?: ReactNode
  showNoRequestsMessage: boolean
  onSelectRequest: (data: ProxyData | null) => void
  onRenameGroup?: (group: Group) => void
  resetProxyData?: () => void
}

export function RequestsSection({
  proxyData,
  selectedRequestId,
  noRequestsMessage,
  autoScroll = false,
  groups,
  activeGroup,
  onSelectRequest,
  onRenameGroup,
  resetProxyData,
  showNoRequestsMessage,
}: RequestsSectionProps) {
  const [filteredProxyData, setFilterdedProxyData] = useState<ProxyData[]>([])
  const groupedProxyData = groupProxyData(filteredProxyData)
  const ref = useAutoScroll(groupedProxyData, autoScroll)

  if (showNoRequestsMessage) {
    return <NoRequestsMessage noRequestsMessage={noRequestsMessage} />
  }

  return (
    <Flex direction="column" minHeight="0" height="100%">
      <Flex justify="between" pr="2">
        <Flex align="center" gap="1">
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

      <ScrollArea scrollbars="both">
        <div ref={ref} css={{ minWidth: '500px' }}>
          <WebLogView
            requests={filteredProxyData}
            groups={groups}
            activeGroup={activeGroup}
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
            onRenameGroup={onRenameGroup}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
