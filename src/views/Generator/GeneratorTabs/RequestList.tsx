import { Flex, ScrollArea } from '@radix-ui/themes'
import { useShallowCompareEffect } from 'react-use'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useStudioUIStore } from '@/store/ui'
import { useGeneratorStore } from '@/store/generator'
import { EmptyMessage } from '@/components/EmptyMessage'
import { validateRecording } from './RequestList.utils'
import { RequestListHeader } from './RequestListHeader'
import { useApplyRules } from '@/store/hooks/useApplyRules'
import { RequestTable } from './RequestTable'

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
  const previewOriginalRequests = useGeneratorStore(
    (state) => state.previewOriginalRequests
  )

  const { requestsWithRulesApplied, selectedRuleInstance } = useApplyRules()

  const {
    filter,
    setFilter,
    filteredRequests,
    filterAllData,
    setFilterAllData,
  } = useFilterRequests({
    proxyData: previewOriginalRequests ? requests : requestsWithRulesApplied,
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
      {!recordingError && (
        <RequestListHeader
          filter={filter}
          setFilter={setFilter}
          filterAllData={filterAllData}
          setFilterAllData={setFilterAllData}
        />
      )}

      <ScrollArea scrollbars="vertical">
        {recordingError && (
          <EmptyMessage
            px="4"
            message={recordingError.message}
            action={recordingError.action}
          />
        )}

        {!recordingError && (
          <WebLogView
            requests={filteredRequests}
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={onSelectRequest}
            groups={groups}
            filter={filter}
            ListComponent={(props) => (
              <RequestTable
                {...props}
                selectedRuleInstance={selectedRuleInstance}
              />
            )}
          />
        )}
      </ScrollArea>
    </Flex>
  )
}
