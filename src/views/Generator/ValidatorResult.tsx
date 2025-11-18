import { ReactNode, useEffect, useState } from 'react'

import { ValidatorLayout } from '@/components/Validator/ValidatorLayout'
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

  const details = selectedRequest && (
    <HttpRequestDetails
      selectedRequest={selectedRequest}
      onSelectRequest={setSelectedRequest}
    />
  )

  return (
    <ValidatorLayout
      isRunning={isRunning}
      script={script}
      logs={logs}
      checks={checks}
      details={details}
    >
      <RequestsSection
        proxyData={proxyData}
        autoScroll={isRunning}
        selectedRequestId={selectedRequest?.id}
        noDataElement={noDataElement}
        onSelectRequest={setSelectedRequest}
        groups={groups}
      />
    </ValidatorLayout>
  )
}
