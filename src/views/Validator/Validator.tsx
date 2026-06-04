import { Flex } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useCurrentFile } from '@/hooks/useCurrentFile'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'
import { useSaveFile } from '@/hooks/useSaveFile'
import { getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { queryClient } from '@/utils/query'

import { Debugger } from './Debugger'
import { useDebugSession, useScript } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

interface ValidatorProps {
  file: StudioFile
}

function Content({ file }: ValidatorProps) {
  const { data, isLoading } = useScript(file.path)

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)
  const [scriptContent, setScriptContent] = useState<string | undefined>(
    undefined
  )
  const hasInitialized = useRef(false)

  const showToast = useToast()
  const handleSelectExternalScript = useOpenExternalScript()
  const navigate = useNavigate()

  // Initialize scriptContent once when data first loads
  useEffect(() => {
    if (data?.data !== undefined && !hasInitialized.current) {
      hasInitialized.current = true
      setScriptContent(data.data)
    }
  }, [data?.data])

  const currentScript = scriptContent ?? data?.data ?? ''

  const isDirty =
    data !== undefined &&
    scriptContent !== undefined &&
    scriptContent !== data.data

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'script' as const,
      data: currentScript,
      isExternal: data?.isExternal ?? false,
      options: data?.options ?? {},
    }),
    filters: [{ name: 'k6 Script', extensions: ['js'] }],
    onSave: async (location) => {
      await queryClient.invalidateQueries({
        queryKey: ['script', location.path],
      })

      if (location.path !== file.path) {
        navigate(getViewPath('script', location.path), { replace: true })
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

  const scenarios = data?.options?.scenarios
    ? Object.keys(data.options.scenarios)
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
      subTitle={<FileNameHeader file={file} canRename={!data?.isExternal} />}
      actions={
        <ValidatorControls
          file={file}
          isRunning={isRunning}
          canDelete={data !== undefined && !data.isExternal}
          isDirty={isDirty}
          scenarios={scenarios}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
          onSave={handleSave}
        />
      }
      loading={isLoading}
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Debugger
          file={file}
          script={currentScript}
          options={data?.options ?? {}}
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

export function Validator() {
  const file = useCurrentFile('script')

  return <Content key={file.path} file={file} />
}
