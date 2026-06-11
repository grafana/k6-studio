import { Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { ScriptContent } from '@/handlers/fs/types'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { Debugger } from './Debugger'
import { useDebugSession } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

interface ValidatorProps {
  file: StudioFile
  content: ScriptContent
}

export function Validator({ file, content }: ValidatorProps) {
  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const showToast = useToast()
  const handleSelectExternalScript = useOpenExternalScript()

  const { session, startDebugging, stopDebugging } = useDebugSession({
    type: 'file',
    path: file.path,
  })

  const isRunning = session?.state === 'running'

  const scenarios = content.options?.scenarios
    ? Object.keys(content.options.scenarios)
    : ['default']

  async function handleDebugScript(scenarioName?: string) {
    await startDebugging(scenarioName)
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
      subTitle={<FileNameHeader file={file} canRename={!content.isExternal} />}
      actions={
        <ValidatorControls
          file={file}
          isRunning={isRunning}
          canDelete={!content.isExternal}
          scenarios={scenarios}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Debugger
          file={file}
          script={content.data}
          options={content.options}
          session={session}
          onDebugScript={handleDebugScript}
        />
      </Flex>
      <RunInCloudDialog
        open={showRunInCloudDialog}
        script={{ type: 'file', path: file.path }}
        onOpenChange={setShowRunInCloudDialog}
      />
    </View>
  )
}
