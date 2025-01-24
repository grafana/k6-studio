import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { useShallowCompareEffect } from 'react-use'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useStudioUIStore } from '@/store/ui'
import { useGeneratorStore } from '@/store/generator'
import { EmptyMessage } from '@/components/EmptyMessage'
import { GlobeIcon } from '@radix-ui/react-icons'

interface RequestListProps {
  requests: ProxyData[]
  onSelectRequest: (request: ProxyData | null) => void
  selectedRequest: ProxyData | null
}

export function RequestList({
  requests,
  onSelectRequest,
  selectedRequest,
}: RequestListProps) {
  const {
    filter,
    setFilter,
    filteredRequests,
    filterAllData,
    setFilterAllData,
  } = useFilterRequests({
    proxyData: requests,
  })

  const groups = useProxyDataGroups(requests)

  const recordings = useStudioUIStore((state) => state.recordings)
  const recordingPath = useGeneratorStore((state) => state.recordingPath)
  const allowlist = useGeneratorStore((store) => store.allowlist)

  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

  const recording = recordings.get(recordingPath)

  const isRecordingMissing = recording === undefined && recordingPath !== ''
  const areHostsSelected = allowlist.length > 0

  // Preserve the selected request when modifying rules
  useShallowCompareEffect(() => {
    onSelectRequest(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
      <ScrollArea scrollbars="vertical">
        {isRecordingMissing && (
          <Flex justify="center" align="center" height="100%">
            <EmptyMessage
              message="The selected recording is missing, select another one from the top menu"
              pt="0"
            />
          </Flex>
        )}
        {!areHostsSelected && (
          <Flex justify="center" align="center" height="100%">
            <EmptyMessage
              message="Get started by selecting hosts you'd like to work on"
              illustration="telescope"
              pt="0"
              action={
                <Button onClick={() => setShowAllowlistDialog(true)}>
                  <GlobeIcon />
                  Select hosts
                </Button>
              }
            />
          </Flex>
        )}
        {!isRecordingMissing && areHostsSelected && (
          <>
            <Filter
              filter={filter}
              setFilter={setFilter}
              css={{
                borderRadius: 0,
                outlineOffset: '-2px',
                boxShadow: 'none',
              }}
              size="2"
              filterAllData={filterAllData}
              setFilterAllData={setFilterAllData}
            />
            <WebLogView
              requests={filteredRequests}
              selectedRequestId={selectedRequest?.id}
              onSelectRequest={onSelectRequest}
              groups={groups}
              filter={filter}
            />
          </>
        )}
      </ScrollArea>
    </Flex>
  )
}
