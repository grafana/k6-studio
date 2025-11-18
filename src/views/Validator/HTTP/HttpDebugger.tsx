import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'

import { ExecutionDetails } from '@/components/Validator/ExecutionDetails'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from '../types'

interface HttpDebuggerProps {
  session: DebugSession
}

export function HttpDebugger({ session }: HttpDebuggerProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  const isRunning = session.state === 'running'

  // Clear selected request when starting a new run
  useEffect(() => {
    if (isRunning) {
      setSelectedRequest(null)
    }
  }, [isRunning])

  return (
    <Allotment defaultSizes={[3, 2]}>
      <Allotment.Pane minSize={250}>
        <Allotment vertical defaultSizes={[1, 1]}>
          <Allotment.Pane>
            <RequestsSection
              proxyData={session.requests}
              autoScroll={isRunning}
              selectedRequestId={selectedRequest?.id}
              onSelectRequest={setSelectedRequest}
              groups={groups}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={250}>
            <Box height="100%">
              <ExecutionDetails
                isRunning={isRunning}
                logs={session.logs}
                checks={session.checks}
              />
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
      {selectedRequest && (
        <Allotment.Pane minSize={300}>
          <HttpRequestDetails
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </Allotment.Pane>
      )}
    </Allotment>
  )
}
