import { css } from '@emotion/react'
import { Box, Button, Tabs } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Allotment } from 'allotment'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { K6Check, K6Log, ProxyData } from '@/types'
import { LogsSection } from './LogsSection'
import { ValidatorControls } from './ValidatorControls'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { getRoutePath } from '@/routeMap'
import { Details } from '@/components/WebLogView/Details'
import { useScriptPath } from './Validator.hooks'
import { useToast } from '@/store/ui/useToast'
import { ChecksSection } from './ChecksSection'

export function Validator() {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [script, setScript] = useState('')
  const { scriptPath, isExternal } = useScriptPath()
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  const [checks, setChecks] = useState<K6Check[]>([])
  const navigate = useNavigate()
  const showToast = useToast()

  const { proxyData, resetProxyData } = useListenProxyData()
  useSetWindowTitle(scriptPath || 'Validator')

  const handleSelectExternalScript = useCallback(async () => {
    const { path = '', content = '' } =
      (await window.studio.script.showScriptSelectDialog()) || {}
    navigate(getRoutePath('validator', {}), {
      state: { externalScriptPath: path },
    })
    setScript(content)
  }, [navigate])

  useEffect(() => {
    if (!scriptPath || isExternal) {
      return
    }

    ;(async () => {
      setIsLoading(true)
      const { content = '' } =
        (await window.studio.script.openScript(scriptPath)) || {}
      setIsLoading(false)
      setScript(content)
    })()
  }, [scriptPath, isExternal])

  async function handleDeleteScript() {
    if (isExternal || !scriptPath) {
      return
    }

    await window.studio.ui.deleteFile(scriptPath)
    navigate(getRoutePath('home'))
  }

  function handleRunScript() {
    if (!scriptPath) {
      return
    }

    resetProxyData()
    setLogs([])
    window.studio.script.runScript(scriptPath, isExternal)
    setIsRunning(true)
  }

  function handleStopScript() {
    window.studio.script.stopScript()
    setIsRunning(false)
    showToast({
      title: 'Script execution stopped',
      status: 'error',
    })
  }

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      setIsRunning(false)
      showToast({
        title: 'Script execution finished',
        status: 'success',
      })
    })
  }, [showToast])

  useEffect(() => {
    return window.studio.script.onScriptLog((log) => {
      setLogs((prev) => [...prev, log])
    })
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptCheck((checks) => {
      setChecks(checks)
    })
  }, [])

  useEffect(() => {
    // Reset requests and logs when script changes
    resetProxyData()
    setLogs([])
    setSelectedRequest(null)
  }, [script, resetProxyData])

  return (
    <View
      title="Validator"
      actions={
        <ValidatorControls
          isRunning={isRunning}
          isExternal={isExternal}
          isScriptSelected={Boolean(scriptPath)}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleRunScript}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[3, 2]}>
        <Allotment.Pane minSize={300}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane>
              <RequestsSection
                proxyData={proxyData}
                autoScroll={isRunning}
                selectedRequestId={selectedRequest?.id}
                noRequestsMessage={
                  !scriptPath ? (
                    <Button onClick={handleSelectExternalScript}>
                      Open script
                    </Button>
                  ) : (
                    'Once you start the script, requests will appear here'
                  )
                }
                onSelectRequest={setSelectedRequest}
              />
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <Box height="100%">
                <Tabs.Root
                  defaultValue="script"
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
                    <Tabs.Trigger value="logs">
                      Logs ({logs.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger value="checks">
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
                    value="checks"
                    css={css`
                      flex: 1;
                      min-height: 0;
                    `}
                  >
                    <ChecksSection checks={checks} isRunning={isRunning} />
                  </Tabs.Content>
                  <Tabs.Content
                    value="script"
                    css={css`
                      flex: 1;
                    `}
                  >
                    <ReadOnlyEditor language="javascript" value={script} />
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
    </View>
  )
}
