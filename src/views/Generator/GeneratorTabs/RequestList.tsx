import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'
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
import { GlobeIcon } from '@radix-ui/react-icons'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
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
    setSelectedRequest(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
      <div
        css={css`
          flex-grow: 1;
        `}
      >
        <Allotment defaultSizes={[1, 1]}>
          <Allotment.Pane minSize={200}>
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
