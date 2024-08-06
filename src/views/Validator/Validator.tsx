import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Allotment } from 'allotment'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { K6Log } from '@/types'
import { getFileNameFromPath } from '@/utils/file'
import { LogsPaneContent } from './LogsPaneContent'
import { ScriptPaneContent } from './ScriptPaneContent'
import { RequestPaneContent } from './RequestsPaneContent'
import { ValidatorControls } from './ValidatorControls'
import { View } from '@/components/Layout/View'
import { groupBy } from 'lodash-es'

export function Validator() {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptPath, setScriptPath] = useState<string>()
  const [script, setScript] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  const { path: paramScriptPath } = useParams()
  const fileName = getFileNameFromPath(paramScriptPath ?? '')

  const { proxyData, resetProxyData } = useListenProxyData()
  useSetWindowTitle(fileName || 'Validator')

  // k6 returns group as comment
  const groupedProxyData = groupBy(
    proxyData,
    (item) => item.comment || 'Default'
  )

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
          onRunScript={handleRunScript}
          onSelectScript={handleSelectScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <Allotment vertical defaultSizes={[3, 2]}>
        <Allotment.Pane minSize={300}>
          <Allotment defaultSizes={[1, 1]}>
            <Allotment.Pane>
              <RequestPaneContent requests={groupedProxyData} />
            </Allotment.Pane>
            <Allotment.Pane>
              <ScriptPaneContent script={script} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <LogsPaneContent logs={logs} />
        </Allotment.Pane>
      </Allotment>
    </View>
  )
}
