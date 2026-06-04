import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { GlobeIcon } from 'lucide-react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { WebLogView } from '@/components/WebLogView'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useGeneratorStore } from '@/store/generator'
import { useApplyRules } from '@/store/generator/hooks/useApplyRules'
import { useHighlightRequestChanges } from '@/store/generator/hooks/useHighlightRequestChanges'
import { ProxyData } from '@/types'

import { RecordingSelector } from '../../RecordingSelector'

import { Header } from './Header'
import { RequestTable } from './RequestTable'

interface RequestListProps {
  requests: ProxyData[]
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
  onChangeRecording: (newPath: string) => void
}

export function RequestList({
  requests,
  selectedRequest,
  onSelectRequest,
  onChangeRecording,
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

  const recordingError = useGeneratorStore((state) => state.recordingError)

  const allowlist = useGeneratorStore((store) => store.allowlist)

  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

  const requestWithHighlights = useHighlightRequestChanges(filteredRequests)

  if (recordingError !== null) {
    return (
      <EmptyMessage
        px="4"
        message="The selected recording could not be loaded, select another one from the dropdown"
        action={
          <RecordingSelector error onChangeRecording={onChangeRecording} />
        }
      ></EmptyMessage>
    )
  }

  if (allRequests.length === 0) {
    return (
      <EmptyMessage
        px="4"
        message="The selected recording is empty, select another one from the dropdown"
        action={<RecordingSelector onChangeRecording={onChangeRecording} />}
      />
    )
  }

  if (allowlist.length === 0) {
    return (
      <EmptyMessage
        px="4"
        message="Get started by selecting hosts you'd like to work on"
        action={
          <Button onClick={() => setShowAllowlistDialog(true)}>
            <GlobeIcon />
            Select hosts
          </Button>
        }
      />
    )
  }

  if (filteredRequests.length === 0 && filter.trim() === '') {
    return (
      <EmptyMessage
        px="4"
        message="Selected hosts generated only static requests, enable static assets or select different hosts"
        action={
          <Button onClick={() => setShowAllowlistDialog(true)}>
            <GlobeIcon />
            Select hosts
          </Button>
        }
      />
    )
  }

  return (
    <Flex direction="column" height="100%">
      <Header
        filter={filter}
        filterAllData={filterAllData}
        setFilter={setFilter}
        setFilterAllData={setFilterAllData}
        onChangeRecording={onChangeRecording}
      />

      <ScrollArea scrollbars="vertical">
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
      </ScrollArea>
    </Flex>
  )
}
