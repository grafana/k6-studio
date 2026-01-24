import { Flex } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { Debugger } from './Debugger'
import { useDebugSession, useScript, useScriptPath } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

interface ValidatorProps {
  file: StudioFile
}

function Content({ file }: ValidatorProps) {
  const { data, isLoading } = useScript(file)

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const navigate = useNavigate()
  const showToast = useToast()

  const { session, startDebugging, stopDebugging } = useDebugSession({
    type: 'file',
    path: file.filePath,
  })

  const isRunning = session?.state === 'running'

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

  async function handleDebugScript() {
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
          file={file}
          isRunning={isRunning}
          canDelete={data !== undefined && !data.isExternal}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Debugger
          script={data?.script ?? ''}
          options={data?.options ?? {}}
          session={session}
          onDebugScript={handleDebugScript}
        />
      </Flex>
      <RunInCloudDialog
        open={showRunInCloudDialog}
        script={{
          type: 'file',
          path: file.filePath,
        }}
        onOpenChange={setShowRunInCloudDialog}
      />
    </View>
  )
}

export function Validator() {
  const file = useScriptPath()

  return <Content key={file.filePath} file={file} />
}
