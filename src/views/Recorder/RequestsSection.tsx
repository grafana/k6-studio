import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { Group, ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
import { Box, Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { ClearRequestsButton } from './ClearRequestsButton'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  groups?: Group[]
  selectedRequestId?: string
  autoScroll?: boolean
  activeGroup?: string
  noRequestsMessage?: ReactNode
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
}: RequestsSectionProps) {
  const {
    filter,
    setFilter,
    includeStaticAssets,
    setIncludeStaticAssets,
    staticAssetCount,
    filteredRequests,
  } = useFilterRequests(proxyData)
  const groupedProxyData = groupProxyData(filteredRequests)
  const ref = useAutoScroll(groupedProxyData, autoScroll)

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
            Requests ({filteredRequests.length})
          </Heading>
          {resetProxyData && (
            <ClearRequestsButton
              handleConfirm={resetProxyData}
              disabled={proxyData.length === 0}
            />
          )}
        </Flex>

        <Flex gap="2" align="center">
          <StaticAssetsFilter
            includeStaticAssets={includeStaticAssets}
            setIncludeStaticAssets={setIncludeStaticAssets}
            staticAssetCount={staticAssetCount}
          />

          <Box width="200px">
            <Filter filter={filter} setFilter={setFilter} />
          </Box>
        </Flex>
      </Flex>

      <ScrollArea scrollbars="both">
        <div ref={ref} css={{ minWidth: '500px' }}>
          <WebLogView
            requests={filteredRequests}
            groups={groups}
            activeGroup={activeGroup}
            noRequestsMessage={
              filter !== ''
                ? 'No requests matched the filter'
                : noRequestsMessage
            }
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
            onRenameGroup={onRenameGroup}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
