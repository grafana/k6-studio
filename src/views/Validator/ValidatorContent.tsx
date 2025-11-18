import { ReactNode, useEffect, useState } from 'react'

import { ValidatorLayout } from '@/components/Validator/ValidatorLayout'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebugSession } from './types'

interface ValidatorContentProps {
  script: string
  session: DebugSession | null
  noDataElement: ReactNode
}

export function ValidatorContent({
  script,
  session,
  noDataElement,
}: ValidatorContentProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session?.requests ?? [])

  const isRunning = session?.state === 'running'

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
      logs={session?.logs ?? []}
      checks={session?.checks ?? []}
      details={details}
    >
      <RequestsSection
        proxyData={session?.requests ?? []}
        autoScroll={isRunning}
        selectedRequestId={selectedRequest?.id}
        noDataElement={noDataElement}
        onSelectRequest={setSelectedRequest}
        groups={groups}
      />
    </ValidatorLayout>
  )
}
