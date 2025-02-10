import { Flex, ScrollArea } from '@radix-ui/themes'
import { useShallowCompareEffect } from 'react-use'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useStudioUIStore } from '@/store/ui'
import { useGeneratorStore } from '@/store/generator'
import { EmptyMessage } from '@/components/EmptyMessage'
import { validateRecording } from './RequestList.utils'

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
  const allRequests = useGeneratorStore((state) => state.requests)

  const groups = useProxyDataGroups(requests)

  const recordings = useStudioUIStore((state) => state.recordings)
  const recordingPath = useGeneratorStore((state) => state.recordingPath)
  const allowlist = useGeneratorStore((store) => store.allowlist)

  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

  const recording = recordings.get(recordingPath)

  const recordingError = validateRecording({
    allowlist,
    requests: allRequests,
    filteredRequests,
    recordingPath,
    recording,
    filter,
    setShowAllowlistDialog,
  })

  // Preserve the selected request when modifying rules
  useShallowCompareEffect(() => {
    onSelectRequest(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
      <ScrollArea scrollbars="vertical">
        {recordingError && (
          <EmptyMessage
            px="4"
            message={recordingError.message}
            action={recordingError.action}
          />
        )}

        {!recordingError && (
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
