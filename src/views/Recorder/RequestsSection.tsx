import { css } from '@emotion/react'
import { Box, Flex, Heading, ScrollArea, Spinner } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { useLocalStorage } from 'react-use'

import { StaticAssetsFilter } from '@/components/StaticAssetsFilter'
import { WebLogView } from '@/components/WebLogView'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { Group, ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'

import { ClearRequestsButton } from './ClearRequestsButton'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  groups: Group[]
  selectedRequestId?: string
  autoScroll?: boolean
  noDataElement?: ReactNode
  onSelectRequest: (data: ProxyData | null) => void
  onUpdateGroup?: (group: Group) => void
  resetProxyData?: () => void
}

export function RequestsSection({
  proxyData,
  selectedRequestId,
  noDataElement,
  autoScroll = false,
  groups,
  onSelectRequest,
  onUpdateGroup,
  resetProxyData,
}: RequestsSectionProps) {
  const [includeStaticAssets, setIncludeStaticAssets] = useLocalStorage(
    'includeStaticAssets',
    false
  )

  const {
    filter,
    setFilter,
    staticAssetCount,
    filteredRequests,
    filterAllData,
    setFilterAllData,
  } = useFilterRequests({ proxyData, includeStaticAssets })

  const groupedProxyData = groupProxyData(filteredRequests)
  const ref = useAutoScroll(groupedProxyData, autoScroll)

  const showNoDataState = proxyData.length === 0 && noDataElement !== undefined

  if (showNoDataState) {
    return noDataElement
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
              display: flex;
              align-items: center;
            `}
          >
            Requests ({filteredRequests.length}){' '}
            {autoScroll && <Spinner ml="2" />}
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

          <Box width="300px">
            <Filter
              filter={filter}
              setFilter={setFilter}
              filterAllData={filterAllData}
              setFilterAllData={setFilterAllData}
            />
          </Box>
        </Flex>
      </Flex>
      <ScrollArea scrollbars="both">
        <div ref={ref} css={{ minWidth: '500px' }}>
          <WebLogView
            requests={filteredRequests}
            groups={groups}
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
            onUpdateGroup={onUpdateGroup}
            filter={filter}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
