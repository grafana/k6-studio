import { ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Details } from '@/components/WebLogView/Details'
import { useShallowCompareEffect } from 'react-use'

interface RequestListProps {
  requests: ProxyData[]
}

export function RequestList({ requests }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  // Preserve the selected request when modifiying rules
  useShallowCompareEffect(() => {
    setSelectedRequest(null)
  }, [requests])

  return (
    <Allotment vertical defaultSizes={[1, 2]}>
      <Allotment.Pane minSize={200}>
        <ScrollArea scrollbars="vertical">
          <WebLogView
            requests={requests}
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={setSelectedRequest}
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
