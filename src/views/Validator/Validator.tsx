import { Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { ScriptContent } from '@/handlers/fs/types'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'
import { useSaveFile } from '@/hooks/useSaveFile'
import { getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { queryClient } from '@/utils/query'

import { Debugger } from './Debugger'
import { useDebugSession } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

interface ValidatorProps {
  file: StudioFile
  content: ScriptContent
}

export function Validator({ file, content }: ValidatorProps) {
  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)
  const [scriptContent, setScriptContent] = useState<string>(content.data)

  const showToast = useToast()
  const handleSelectExternalScript = useOpenExternalScript()
  const navigate = useNavigate()

  const isDirty = scriptContent !== content.data

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'script' as const,
      data: scriptContent,
      isExternal: content.isExternal ?? false,
      options: content.options ?? {},
    }),
    filters: [{ name: 'k6 Script', extensions: ['js'] }],
    onSave: async (location) => {
      await queryClient.invalidateQueries({
        queryKey: ['script', location.path],
      })

      if (location.path !== file.path) {
        navigate(getViewPath(location.path), { replace: true })
      }
    },
    onError: (error) => {
      showToast({
        title: 'Failed to save script',
        status: 'error',
        description: error.message,
      })
    },
  })

  const handleSave = () => {
    void saveFile({ saveAs: false })
  }

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
          isDirty={isDirty}
          canDelete={!content.isExternal}
          scenarios={scenarios}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
          onSave={handleSave}
        />
      }
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Debugger
          file={file}
          script={scriptContent}
          options={content.options}
          session={session}
          onDebugScript={handleDebugScript}
          onScriptChange={setScriptContent}
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
