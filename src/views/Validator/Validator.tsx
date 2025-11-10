import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import { useScript, useScriptPath } from './Validator.hooks'
import { ValidatorContent } from './ValidatorContent'
import { ValidatorControls } from './ValidatorControls'
import { ValidatorEmptyState } from './ValidatorEmptyState'

export function Validator() {
  const scriptPath = useScriptPath()

  const { data, isLoading } = useScript(scriptPath)

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const [isRunning, setIsRunning] = useState(false)

  const { checks, resetChecks } = useRunChecks()
  const { logs, resetLogs } = useRunLogs()

  const navigate = useNavigate()
  const showToast = useToast()

  const { proxyData, resetProxyData } = useListenProxyData()

  const file: StudioFile = {
    type: 'script',
    fileName: scriptPath,
    displayName: getFileNameWithoutExtension(scriptPath),
  }

  const handleSelectExternalScript = useCallback(async () => {
    const newScriptPath = await window.studio.script.showScriptSelectDialog()

    if (!newScriptPath) {
      return
    }

    navigate(
      getRoutePath('validator', {
        fileName: encodeURIComponent(newScriptPath),
      })
    )
  }, [navigate])

  async function handleDeleteScript() {
    if (!file) {
      return
    }

    await window.studio.ui.deleteFile(file)
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

    await window.studio.script.runScript(scriptPath)
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
  }, [scriptPath, resetProxyData, resetLogs, resetChecks])

  return (
    <View
      title="Validator"
      subTitle={<FileNameHeader file={file} canRename={!data?.isExternal} />}
      actions={
        <ValidatorControls
          isRunning={isRunning}
          canDelete={data !== undefined && !data.isExternal}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleRunScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      {data && (
        <ValidatorContent
          script={data.script}
          proxyData={proxyData}
          isRunning={isRunning}
          logs={logs}
          checks={checks}
          noDataElement={
            <EmptyMessage
              message={
                <ValidatorEmptyState
                  isRunning={isRunning}
                  onRunScript={handleRunScript}
                />
              }
            />
          }
        />
      )}
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
