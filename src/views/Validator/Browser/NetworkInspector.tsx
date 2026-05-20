import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData, StudioFile } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from '../types'

import { ExportNetworkTrafficButton } from './ExportNetworkTrafficButton'

interface NetworkInspectorProps {
  file: StudioFile
  session: DebugSession
}

export function NetworkInspector({ file, session }: NetworkInspectorProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  return (
    <Allotment>
      <Allotment.Pane minSize={250}>
        <Box height="100%">
          <RequestsSection
            proxyData={session.requests}
            autoScroll={session.state === 'running'}
            actions={
              <ExportNetworkTrafficButton file={file} session={session} />
            }
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
