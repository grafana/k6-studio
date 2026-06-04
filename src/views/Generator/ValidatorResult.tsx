import { useEffect, useState, ReactNode } from 'react'

import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { ExecutionDetails } from '@/components/Validator/ExecutionDetails'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

interface ValidatorResult {
  script: string
  proxyData: ProxyData[]
  noDataElement: ReactNode
  isRunning: boolean
  logs: LogEntry[]
  checks: Check[]
}

export function ValidatorResult({
  script,
  proxyData,
  isRunning,
  logs,
  checks,
  noDataElement,
}: ValidatorResult) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(proxyData)

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
    <Group>
      <Panel id="main" minSize={250}>
        <Group orientation="vertical">
          <Panel id="requests">
            <RequestsSection
              proxyData={proxyData}
              autoScroll={isRunning}
              selectedRequestId={selectedRequest?.id}
              noDataElement={noDataElement}
              onSelectRequest={setSelectedRequest}
              groups={groups}
            />
          </Panel>
          <Separator />
          <Panel id="execution" minSize={250}>
            <ExecutionDetails
              isRunning={isRunning}
              script={script}
              logs={logs}
              checks={checks}
            />
          </Panel>
        </Group>
      </Panel>
      {selectedRequest && (
        <>
          <Separator />
          <Panel id="details" defaultSize="40%" minSize={300}>
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
