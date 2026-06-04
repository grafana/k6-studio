import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from '@/components/primitives/ResizablePanel'
import { ExecutionDetails } from '@/components/Validator/ExecutionDetails'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'
import { RequestsSection } from '@/views/Recorder/RequestsSection'

import { DebuggerEmptyState } from '../DebuggerEmptyState'
import { DebugSession } from '../types'

const TabsContent = styled(Tabs.Content)`
  overflow: hidden;
  flex: 1 1 0;
`

interface HttpDebuggerProps {
  script: string
  session: DebugSession
  onDebugScript: () => void
}

export function HttpDebugger({
  script,
  session,
  onDebugScript,
}: HttpDebuggerProps) {
  const [tab, setTab] = useState('script')

  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const groups = useProxyDataGroups(session.requests)

  const isRunning = session.state === 'running'

  const mainLayout = useDefaultLayout({ id: 'http-debugger-main' })
  const innerLayout = useDefaultLayout({ id: 'http-debugger-inner' })

  // Clear selected request when starting a new run
  useEffect(() => {
    if (isRunning) {
      setTab('requests')
      setSelectedRequest(null)
    }
  }, [isRunning])

  return (
    <Group {...mainLayout}>
      <Panel id="main" minSize={250}>
        <Group orientation="vertical" {...innerLayout}>
          <Panel id="tabs">
            <Tabs.Root asChild value={tab} onValueChange={setTab}>
              <Flex direction="column" height="100%" overflow="hidden">
                <Tabs.List
                  css={css`
                    flex-shrink: 0;
                  `}
                >
                  <Tabs.Trigger value="script">Script</Tabs.Trigger>
                  <Tabs.Trigger value="requests">Requests</Tabs.Trigger>
                </Tabs.List>
                <TabsContent value="script">
                  <ReadOnlyEditor
                    value={script}
                    showToolbar={false}
                    language="typescript"
                  />
                </TabsContent>
                <TabsContent value="requests">
                  {session.state === 'pending' && (
                    <DebuggerEmptyState onDebugScript={onDebugScript}>
                      Debug the script to inspect network requests.
                    </DebuggerEmptyState>
                  )}
                  {session.state !== 'pending' && (
                    <RequestsSection
                      proxyData={session.requests}
                      autoScroll={isRunning}
                      selectedRequestId={selectedRequest?.id}
                      onSelectRequest={setSelectedRequest}
                      groups={groups}
                    />
                  )}
                </TabsContent>
              </Flex>
            </Tabs.Root>
          </Panel>
          <Separator />
          <Panel id="execution" minSize={250}>
            <Box height="100%">
              <ExecutionDetails
                isRunning={isRunning}
                logs={session.logs}
                checks={session.checks}
              />
            </Box>
          </Panel>
        </Group>
      </Panel>
      {selectedRequest && (
        <>
          <Separator />
          <Panel id="details" minSize={300}>
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
