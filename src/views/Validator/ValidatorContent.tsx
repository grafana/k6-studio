import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { ReactNode, useEffect, useState } from 'react'

import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from './types'

interface ValidatorContentProps {
  isRunning: boolean
  script: string
  session: DebugSession
  noDataElement: ReactNode
}

export function ValidatorContent({
  script,
  session,
  isRunning,
  noDataElement,
}: ValidatorContentProps) {
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

  const details = selectedRequest && (
    <HttpRequestDetails
      selectedRequest={selectedRequest}
      onSelectRequest={setSelectedRequest}
    />
  )

  return (
    <Allotment>
      <Allotment.Pane minSize={250}>
        <Box height="100%">
          <RequestsSection
            proxyData={session.requests}
            autoScroll={isRunning}
            selectedRequestId={selectedRequest?.id}
            noDataElement={noDataElement}
            groups={groups}
            onSelectRequest={setSelectedRequest}
          />
        </Box>
      </Allotment.Pane>
      {selectedRequest !== null && <Allotment.Pane>{details}</Allotment.Pane>}
    </Allotment>
  )
}
