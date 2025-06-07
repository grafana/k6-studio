import { Flex, ScrollArea } from '@radix-ui/themes'

import { EmptyMessage } from '@/components/EmptyMessage'
import { WebLogView } from '@/components/WebLogView'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useGeneratorStore } from '@/store/generator'
import { useApplyRules } from '@/store/generator/hooks/useApplyRules'
import { useHighlightRequestChanges } from '@/store/generator/hooks/useHighlightRequestChanges'
import { useStudioUIStore } from '@/store/ui'
import { ProxyData } from '@/types'

import { Header } from './Header'
import { validateRecording } from './RequestList.utils'
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

  const requestWithHighlights = useHighlightRequestChanges(filteredRequests)

  return (
    <Flex direction="column" height="100%">
      {!recordingError && (
        <Header
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
            requests={requestWithHighlights}
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
