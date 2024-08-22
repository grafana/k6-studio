import { css } from '@emotion/react'
import { Box, Tabs } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Allotment } from 'allotment'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { K6Log } from '@/types'
import { getFileNameFromPath } from '@/utils/file'
import { LogsSection } from './LogsSection'
import { ValidatorControls } from './ValidatorControls'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { getRoutePath } from '@/routeMap'

export function Validator() {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptPath, setScriptPath] = useState<string>()
  const [script, setScript] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  const { path: paramScriptPath } = useParams()
  const navigate = useNavigate()
  const fileName = getFileNameFromPath(paramScriptPath ?? '')

  const { proxyData, resetProxyData } = useListenProxyData()
  useSetWindowTitle(fileName || 'Validator')

  const handleSelectScript = useCallback(async () => {
    const { path = '', content = '' } =
      (await window.studio.script.showScriptSelectDialog()) || {}
    setScriptPath(path)
    setScript(content)
  }, [])

  useEffect(() => {
    if (!paramScriptPath) {
      return
    }

    ;(async () => {
      setIsLoading(true)
      const { path = '', content = '' } =
        (await window.studio.script.openScript(paramScriptPath)) || {}
      setIsLoading(false)
      setScriptPath(path)
      setScript(content)
    })()
  }, [paramScriptPath])

  async function handleDeleteScript() {
    if (!paramScriptPath) {
      return
    }
    await window.studio.ui.deleteFile(paramScriptPath)
    navigate(getRoutePath('home'))
  }

  function handleRunScript() {
    if (!scriptPath || !script) {
      return
    }

    resetProxyData()
    setLogs([])

    window.studio.script.runScript(scriptPath)
    setIsRunning(true)
  }

  function handleStopScript() {
    window.studio.script.stopScript()
  }

  useEffect(() => {
    return window.studio.script.onScriptStopped(() => {
      setIsRunning(false)
    })
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptLog((log) => {
      setLogs((prev) => [...prev, log])
    })
  }, [])

  useEffect(() => {
    // Reset requests and logs when script changes
    resetProxyData()
    setLogs([])
  }, [script, resetProxyData])

  return (
    <View
      title={`Validator${paramScriptPath ? ` - ${getFileNameFromPath(paramScriptPath)}` : ''}`}
      actions={
        <ValidatorControls
          isRunning={isRunning}
          isScriptSelected={Boolean(scriptPath)}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleRunScript}
          onSelectScript={handleSelectScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <Allotment vertical defaultSizes={[1, 1]}>
        <Allotment.Pane>
          <RequestsSection proxyData={proxyData} autoScroll={isRunning} />
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
                <Tabs.Trigger value="logs">Logs ({logs.length})</Tabs.Trigger>
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
                `}
              >
                <ReadOnlyEditor language="javascript" value={script} />
              </Tabs.Content>
            </Tabs.Root>
          </Box>
        </Allotment.Pane>
      </Allotment>
    </View>
  )
}
