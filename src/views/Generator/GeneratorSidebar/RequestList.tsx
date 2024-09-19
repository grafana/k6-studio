import { ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Details } from '@/components/WebLogView/Details'
import { useShallowCompareEffect } from 'react-use'
import { Filter } from '@/components/WebLogView/Filter'
import { useFilterRequests } from '@/components/WebLogView/Filter.hooks'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const { filter, setFilter, filteredRequests } = useFilterRequests(requests)

  // Preserve the selected request when modifiying rules
  useShallowCompareEffect(() => {
    setSelectedRequest(null)
  }, [requests])

  return (
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
  )
}
