import { Box, Flex, ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { css } from '@emotion/react'

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
import { useInspectRequest } from '@/components/WebLogView/Details.hooks'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const { selectedRequest } = useInspectRequest()
  const { filter, setFilter, filteredRequests } = useFilterRequests({
    proxyData: requests,
  })

  const groups = useProxyDataGroups(requests)

  const recordings = useStudioUIStore((state) => state.recordings)
  const recordingPath = useGeneratorStore((state) => state.recordingPath)

  const recording = recordings.get(recordingPath)

  const isRecordingMissing = recording === undefined && recordingPath !== ''

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
                  <WebLogView requests={filteredRequests} groups={groups} />
                </>
              )}
            </ScrollArea>
          </Allotment.Pane>
          <Allotment.Pane minSize={300} visible={!!selectedRequest}>
            <Details />
          </Allotment.Pane>
        </Allotment>
      </div>
    </Flex>
  )
}
