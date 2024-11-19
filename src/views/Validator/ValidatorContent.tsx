import { Allotment } from 'allotment'
import { Box, Tabs } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { ReactNode, useEffect, useState } from 'react'

import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { Details } from '@/components/WebLogView/Details'
import { K6Check, K6Log, ProxyData } from '@/types'
import { LogsSection } from './LogsSection'
import { ChecksSection } from './ChecksSection'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'

interface ValidatorContentProps {
  script: string
  proxyData: ProxyData[]
  noDataElement: ReactNode
  isRunning: boolean
  logs: K6Log[]
  checks: K6Check[]
}

type ValidatorTabValue = 'logs' | 'checks' | 'script'

export function ValidatorContent({
  script,
  proxyData,
  isRunning,
  logs,
  checks,
  noDataElement,
}: ValidatorContentProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [selectedTab, setSelectedTab] = useState<ValidatorTabValue>('script')
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

  useEffect(() => {
    return window.studio.script.onScriptFailed(() => {
      setSelectedTab('logs')
    })
  }, [])

  return (
    <Allotment defaultSizes={[3, 2]}>
      <Allotment.Pane minSize={250}>
        <Allotment vertical defaultSizes={[1, 1]}>
          <Allotment.Pane>
            <RequestsSection
              proxyData={proxyData}
              autoScroll={isRunning}
              selectedRequestId={selectedRequest?.id}
              noDataElement={noDataElement}
              onSelectRequest={setSelectedRequest}
              groups={groups}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={250}>
            <Box height="100%">
              <Tabs.Root
                value={selectedTab}
                onValueChange={(value) =>
                  setSelectedTab(value as ValidatorTabValue)
                }
                css={css`
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                `}
              >
                <Tabs.List
                  css={css`
                    flex-shrink: 0;
                  `}
                >
                  <Tabs.Trigger value="logs">Logs ({logs.length})</Tabs.Trigger>
                  <Tabs.Trigger value="checks" disabled={checks.length === 0}>
                    Checks ({checks.length})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="script">Script</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content
                  value="logs"
                  css={css`
                    flex: 1;
                    min-height: 0;
                  `}
                >
                  <LogsSection logs={logs} autoScroll={isRunning} />
                </Tabs.Content>
                <Tabs.Content
                  value="script"
                  css={css`
                    flex: 1;
                    min-height: 0;
                  `}
                >
                  <ReadOnlyEditor language="javascript" value={script} />
                </Tabs.Content>
                <Tabs.Content
                  value="checks"
                  css={css`
                    flex: 1;
                    min-height: 0;
                  `}
                >
                  <ChecksSection checks={checks} isRunning={isRunning} />
                </Tabs.Content>
              </Tabs.Root>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
      {selectedRequest !== null && (
        <Allotment.Pane minSize={300}>
          <Details
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </Allotment.Pane>
      )}
    </Allotment>
  )
}
