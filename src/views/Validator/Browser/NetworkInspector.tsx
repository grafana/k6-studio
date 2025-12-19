import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from '../types'

interface NetworkInspectorProps {
  session: DebugSession
}

export function NetworkInspector({ session }: NetworkInspectorProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  return (
    <Allotment>
      <Allotment.Pane minSize={250}>
        <Box height="100%">
          <RequestsSection
            proxyData={session.requests}
            autoScroll={session.state === 'running'}
            selectedRequestId={selectedRequest?.id}
            groups={groups}
            onSelectRequest={setSelectedRequest}
          />
        </Box>
      </Allotment.Pane>
      {selectedRequest !== null && (
        <Allotment.Pane>
          <HttpRequestDetails
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </Allotment.Pane>
      )}
    </Allotment>
  )
}
