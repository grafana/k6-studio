import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import { useDebugSession, useScript, useScriptPath } from './Validator.hooks'
import { ValidatorContent } from './ValidatorContent'
import { ValidatorControls } from './ValidatorControls'
import { ValidatorEmptyState } from './ValidatorEmptyState'

interface ValidatorProps {
  scriptPath: string
}

function Content({ scriptPath }: ValidatorProps) {
  const { data, isLoading } = useScript(scriptPath)

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const navigate = useNavigate()
  const showToast = useToast()

  const { session, startDebugging, stopDebugging } = useDebugSession(scriptPath)

  const isRunning = session?.state === 'running'

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

  async function handleDebugScript() {
    if (!scriptPath) {
      return
    }

    await startDebugging()
  }

  function handleRunInCloud() {
    setShowRunInCloudDialog(true)
  }

  async function handleStopScript() {
    await stopDebugging()

    showToast({
      title: 'Script execution stopped',
      description: 'The script execution was stopped by the user',
    })
  }

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      showToast({
        title: 'Script execution finished',
        status: 'success',
      })
    })
  }, [showToast])

  useEffect(() => {
    return window.studio.script.onScriptFailed(() => {
      showToast({
        title: 'Script execution finished',
        description: 'The script finished running with errors',
        status: 'error',
      })
    })
  }, [showToast])

  return (
    <View
      title="Validator"
      subTitle={<FileNameHeader file={file} canRename={!data?.isExternal} />}
      actions={
        <ValidatorControls
          isRunning={isRunning}
          canDelete={data !== undefined && !data.isExternal}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleDebugScript}
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
          session={session}
          noDataElement={
            <EmptyMessage
              message={
                <ValidatorEmptyState
                  isRunning={isRunning}
                  onRunScript={handleDebugScript}
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

export function Validator() {
  const scriptPath = useScriptPath()

  return <Content key={scriptPath} scriptPath={scriptPath} />
}
