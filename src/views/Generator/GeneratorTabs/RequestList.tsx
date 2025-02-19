import { Flex, ScrollArea, Switch, Text } from '@radix-ui/themes'
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
import { applyRules } from '@/rules/rules'
import { useMemo } from 'react'
import { getFileNameWithoutExtension } from '@/utils/file'
import { RecorderIcon } from '@/components/icons'

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

  const setPreviewOriginalRequests = useGeneratorStore(
    (store) => store.setPreviewOriginalRequests
  )

  const rules = useGeneratorStore((state) => state.rules)

  const requestsWithRulesApplied = useMemo(() => {
    if (previewOriginalRequests) {
      return requests
    }

    return applyRules(requests, rules).requestSnippetSchemas.map(
      (request) => request.data
    )
  }, [requests, rules, previewOriginalRequests])

  const {
    filter,
    setFilter,
    filteredRequests,
    filterAllData,
    setFilterAllData,
  } = useFilterRequests({
    proxyData: requestsWithRulesApplied,
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
        <Flex justify="between" align="center" px="2" py="1" gap="2">
          <Text color="gray" size="2" truncate>
            <Flex align="center" gap="1">
              <Flex flexShrink="0">
                <RecorderIcon width="22px" />
              </Flex>
              <Text truncate>{getFileNameWithoutExtension(recordingPath)}</Text>
            </Flex>
          </Text>
          <Flex justify="end" align="center" gap="4">
            <Text
              as="label"
              size="1"
              color={previewOriginalRequests ? undefined : 'gray'}
              css={{ whiteSpace: 'nowrap' }}
            >
              <Flex gap="2">
                <Switch
                  size="1"
                  checked={previewOriginalRequests}
                  onCheckedChange={setPreviewOriginalRequests}
                />
                View original requests
              </Flex>
            </Text>

            <Filter
              filter={filter}
              setFilter={setFilter}
              css={{
                width: '300px',
              }}
              size="2"
              filterAllData={filterAllData}
              setFilterAllData={setFilterAllData}
            />
          </Flex>
        </Flex>
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
          <>
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
