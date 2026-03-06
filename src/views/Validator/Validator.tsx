import { Flex } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { K6TestOptions } from '@/utils/k6/schema'

import { Debugger } from './Debugger'
import { useDebugSession } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

export interface ValidatorScriptData {
  script: string
  options: K6TestOptions
  isExternal: boolean
}

interface ValidatorProps {
  file: StudioFile
  scriptData: ValidatorScriptData
}

export function Validator({ file, scriptData }: ValidatorProps) {
  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const navigate = useNavigate()
  const showToast = useToast()

  const { session, startDebugging, stopDebugging } = useDebugSession({
    type: 'file',
    path: file.path,
  })

  const isRunning = session?.state === 'running'

  const handleSelectExternalScript = useCallback(async () => {
    const newScriptPath = await window.studio.script.showScriptSelectDialog()

    if (!newScriptPath) {
      return
    }

    navigate(
      getRoutePath('editorView', {
        path: encodeURIComponent(newScriptPath),
      })
    )
  }, [navigate])

  async function handleDebugScript() {
    if (!file.path) {
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
      subTitle={
        <FileNameHeader file={file} canRename={!scriptData.isExternal} />
      }
      actions={
        <ValidatorControls
          file={file}
          isRunning={isRunning}
          canDelete={!scriptData.isExternal}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Debugger
          script={scriptData.script}
          options={scriptData.options}
          session={session}
          onDebugScript={handleDebugScript}
        />
      </Flex>
      {file.path !== undefined && (
        <RunInCloudDialog
          open={showRunInCloudDialog}
          script={{
            type: 'file',
            path: file.path,
          }}
          onOpenChange={setShowRunInCloudDialog}
        />
      )}
    </View>
  )
}
