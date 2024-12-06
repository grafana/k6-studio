import { Flex, ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useMemo } from 'react'
import { css } from '@emotion/react'
import { useShallowCompareEffect } from 'react-use'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Details } from '@/components/WebLogView/Details'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useStudioUIStore } from '@/store/ui'
import { useGeneratorStore } from '@/store/generator'
import { EmptyMessage } from '@/components/EmptyMessage'
import { atom, useAtom } from 'jotai'

export const selectedRequestAtom = atom<string | null>(null)

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequestId, setSelectedRequestId] = useAtom(selectedRequestAtom)

  const { filter, setFilter, filteredRequests } = useFilterRequests({
    proxyData: requests,
  })

  const selectedRequest = useMemo(() => {
    return filteredRequests.find((req) => req.id === selectedRequestId) ?? null
  }, [selectedRequestId, filteredRequests])

  const groups = useProxyDataGroups(requests)

  const recordings = useStudioUIStore((state) => state.recordings)
  const recordingPath = useGeneratorStore((state) => state.recordingPath)

  const recording = recordings.get(recordingPath)

  const isRecordingMissing = recording === undefined && recordingPath !== ''

  const handleRequestSelected = (request: ProxyData | null) => {
    setSelectedRequestId(request?.id ?? null)
  }

  // Preserve the selected request when modifying rules
  useShallowCompareEffect(() => {
    handleRequestSelected(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
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
                    onSelectRequest={handleRequestSelected}
                    groups={groups}
                  />
                </>
              )}
            </ScrollArea>
          </Allotment.Pane>
          <Allotment.Pane minSize={300} visible={selectedRequest !== null}>
            <Details
              type="tabs"
              selectedRequest={selectedRequest}
              onSelectRequest={handleRequestSelected}
            />
          </Allotment.Pane>
        </Allotment>
      </div>
    </Flex>
  )
}
