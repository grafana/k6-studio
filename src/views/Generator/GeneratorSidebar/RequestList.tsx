import { Box, Flex, ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'
import { css } from '@emotion/react'
import { useShallowCompareEffect } from 'react-use'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Details } from '@/components/WebLogView/Details'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { RecordingSelector } from '../RecordingSelector'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useStudioUIStore } from '@/store/ui'
import { useGeneratorStore } from '@/store/generator'
import { EmptyMessage } from '@/components/EmptyMessage'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const { filter, setFilter, filteredRequests } = useFilterRequests({
    proxyData: requests,
  })

  const groups = useProxyDataGroups(requests)

  const recordings = useStudioUIStore((state) => state.recordings)
  const recordingPath = useGeneratorStore((state) => state.recordingPath)

  const recording = recordings.get(recordingPath)

  const isRecordingMissing = recording === undefined && recordingPath !== ''

  // Preserve the selected request when modifying rules
  useShallowCompareEffect(() => {
    setSelectedRequest(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
      <Box py="2" px="4">
        <RecordingSelector />
      </Box>
      <div
        css={css`
          flex-grow: 1;
        `}
      >
        <Allotment vertical defaultSizes={[1, 2]}>
          <Allotment.Pane minSize={200}>
            <ScrollArea scrollbars="vertical">
              {isRecordingMissing && (
                <Flex direction="column" justify="center" align="center">
                  <EmptyMessage message="The selected recording is missing" />
                </Flex>
              )}
              {!isRecordingMissing && (
                <>
                  <Filter
                    filter={filter}
                    setFilter={setFilter}
                    css={{
                      borderRadius: 0,
                      outlineOffset: '-2px',
                      boxShadow: 'none',
                      borderTop: '1px solid var(--gray-a5)',
                    }}
                    size="2"
                  />
                  <WebLogView
                    requests={filteredRequests}
                    selectedRequestId={selectedRequest?.id}
                    onSelectRequest={setSelectedRequest}
                    groups={groups}
                    filter={filter}
                  />
                </>
              )}
            </ScrollArea>
          </Allotment.Pane>
          <Allotment.Pane minSize={300} visible={selectedRequest !== null}>
            <Details
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
            />
          </Allotment.Pane>
        </Allotment>
      </div>
    </Flex>
  )
}
