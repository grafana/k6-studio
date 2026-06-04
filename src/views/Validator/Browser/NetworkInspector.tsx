import { Box } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from '../types'

interface NetworkInspectorProps {
  actions?: ReactNode
  session: DebugSession
}

export function NetworkInspector({ actions, session }: NetworkInspectorProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  return (
    <Group>
      <Panel id="requests" minSize={250}>
        <Box height="100%">
          <RequestsSection
            proxyData={session.requests}
            autoScroll={session.state === 'running'}
            actions={actions}
            selectedRequestId={selectedRequest?.id}
            groups={groups}
            onSelectRequest={setSelectedRequest}
          />
        </Box>
      </Panel>
      {selectedRequest !== null && (
        <>
          <Separator />
          <Panel id="details">
            <HttpRequestDetails
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
            />
          </Panel>
        </>
      )}
    </Group>
  )
}
