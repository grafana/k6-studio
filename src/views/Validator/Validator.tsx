import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { ValidatorControls } from './ValidatorControls'
import { View } from '@/components/Layout/View'
import { getRoutePath } from '@/routeMap'
import { useScriptPath } from './Validator.hooks'
import { ValidatorContent } from './ValidatorContent'
import { useRunLogs } from '@/hooks/useRunLogs'
import { useToast } from '@/store/ui/useToast'
import { useRunChecks } from '@/hooks/useRunChecks'
import { getFileNameWithoutExtension } from '@/utils/file'
import { ValidatorEmptyState } from './ValidatorEmptyState'
import { EmptyMessage } from '@/components/EmptyMessage'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'

export function Validator() {
  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [script, setScript] = useState('')
  const { scriptPath, isExternal } = useScriptPath()

  const { checks, resetChecks } = useRunChecks()
  const { logs, resetLogs } = useRunLogs()

  const navigate = useNavigate()
  const showToast = useToast()

  const { proxyData, resetProxyData } = useListenProxyData()

  const handleSelectExternalScript = useCallback(async () => {
    const externalScriptPath =
      await window.studio.script.showScriptSelectDialog()

    if (!externalScriptPath) {
      return
    }

    navigate(getRoutePath('validator', {}), {
      state: { externalScriptPath },
    })
  }, [navigate])

  useEffect(() => {
    if (!scriptPath) {
      return
    }

    ;(async () => {
      setIsLoading(true)
      const fileContent = await window.studio.script.openScript(
        scriptPath,
        isExternal
      )
      setIsLoading(false)
      setScript(fileContent)
    })()
  }, [scriptPath, isExternal])

  async function handleDeleteScript() {
    if (isExternal || !scriptPath) {
      return
    }

    await window.studio.ui.deleteFile({
      type: 'script',
      fileName: scriptPath,
      displayName: getFileNameWithoutExtension(scriptPath),
    })
    navigate(getRoutePath('home'))
  }

  async function handleRunScript() {
    if (!scriptPath) {
      return
    }

    resetProxyData()
    resetLogs()
    resetChecks()
    setIsRunning(true)
    await window.studio.script.runScript(scriptPath, isExternal)
  }

  function handleRunInCloud() {
    setShowRunInCloudDialog(true)
  }

  function handleStopScript() {
    window.studio.script.stopScript()
    setIsRunning(false)
    showToast({
      title: 'Script execution stopped',
      description: 'The script execution was stopped by the user',
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
    return window.studio.script.onScriptFailed(() => {
      setIsRunning(false)
      showToast({
        title: 'Script execution finished',
        description: 'The script finished running with errors',
        status: 'error',
      })
    })
  }, [showToast])

  useEffect(() => {
    // Reset requests, logs, and checks when script changes
    resetProxyData()
    resetLogs()
    resetChecks()
  }, [script, resetProxyData, resetLogs, resetChecks])

  return (
    <View
      title="Validator"
      subTitle={getFileNameWithoutExtension(scriptPath ?? '')}
      actions={
        <ValidatorControls
          isRunning={isRunning}
          isExternal={isExternal}
          isScriptSelected={Boolean(scriptPath)}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleRunScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <ValidatorContent
        script={script}
        proxyData={proxyData}
        isRunning={isRunning}
        logs={logs}
        checks={checks}
        noDataElement={
          <EmptyMessage
            message={
              <ValidatorEmptyState
                isRunning={isRunning}
                isScriptSelected={Boolean(scriptPath)}
                onRunScript={handleRunScript}
                onSelectScript={handleSelectExternalScript}
              />
            }
          />
        }
      />
      {scriptPath !== undefined && (
        <RunInCloudDialog
          open={showRunInCloudDialog}
          script={{
            type: 'file',
            path: scriptPath,
          }}
          onOpenChange={setShowRunInCloudDialog}
        />
      )}
    </View>
  )
}
