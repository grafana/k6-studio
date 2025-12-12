import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'

import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from '../types'

interface NetworkInspector {
  isRunning: boolean
  script: string
  session: DebugSession
}

export function NetworkInspector({
  script,
  session,
  isRunning,
}: NetworkInspector) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  useEffect(() => {
    setSelectedRequest(null)
  }, [script])

  // Clear selected request when starting a new run
  useEffect(() => {
    if (isRunning) {
      setSelectedRequest(null)
    }
  }, [isRunning])

  return (
    <Allotment>
      <Allotment.Pane minSize={250}>
        <Box height="100%">
          <RequestsSection
            proxyData={session.requests}
            autoScroll={isRunning}
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
