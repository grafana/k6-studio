import { Flex, ScrollArea } from '@radix-ui/themes'
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
import { Allowlist } from '../Allowlist'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const { filter, setFilter, filteredRequests } = useFilterRequests(requests)

  // Preserve the selected request when modifying rules
  useShallowCompareEffect(() => {
    setSelectedRequest(null)
  }, [requests])

  return (
    <Flex direction="column" height="100%">
      <Flex justify="between" align="center" p="2" wrap="wrap" gap="2">
        <RecordingSelector />
        <Allowlist />
      </Flex>
      <div
        css={css`
          flex-grow: 1;
        `}
      >
        <Allotment vertical defaultSizes={[1, 2]}>
          <Allotment.Pane minSize={200}>
            <ScrollArea scrollbars="vertical">
              <Filter
                filter={filter}
                setFilter={setFilter}
                css={{
                  borderRadius: 0,
                  outline: 'none',
                  boxShadow: '0 1px 0 var(--gray-a5)',
                }}
                size="2"
              />
              <WebLogView
                requests={filteredRequests}
                selectedRequestId={selectedRequest?.id}
                onSelectRequest={setSelectedRequest}
                noRequestsMessage="No requests matched the filter."
              />
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
