import { css } from '@emotion/react'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { K6TestOptions } from '@/utils/k6/schema'

import { Debugger } from './Debugger'
import { useDebugSession, useScriptPath } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'

function TabContent({
  children,
  ...props
}: Omit<Tabs.ContentProps, 'asChild'>) {
  return (
    <Tabs.Content asChild {...props}>
      <Flex
        css={css`
          flex: 1 1 0;
        `}
        align="stretch"
        direction="column"
      >
        {children}
      </Flex>
    </Tabs.Content>
  )
}

type ValidatorTabs = 'script' | 'debugger' | 'network' | 'browser'

export function ValidatorView() {
  const { scriptPath, isExternal } = useScriptPath()

  return (
    <Validator
      key={scriptPath}
      scriptPath={scriptPath ?? ''}
      isExternal={isExternal}
    />
  )
}

interface ValidatorProps {
  scriptPath: string
  isExternal: boolean
}

function Validator({ scriptPath, isExternal }: ValidatorProps) {
  const [currentTab, setCurrentTab] = useState<ValidatorTabs>('script')

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const [script, setScript] = useState('')
  const [options, setOptions] = useState<K6TestOptions>({})

  const navigate = useNavigate()
  const showToast = useToast()

  const { session, startDebugging, stopDebugging } = useDebugSession(
    scriptPath ?? ''
  )

  const file: StudioFile | undefined =
    !isExternal && scriptPath
      ? {
          type: 'script',
          fileName: scriptPath,
          displayName: getFileNameWithoutExtension(scriptPath),
        }
      : undefined

  const handleTabChange = (tab: string) => {
    if (
      tab !== 'script' &&
      tab !== 'debugger' &&
      tab !== 'network' &&
      tab !== 'browser'
    ) {
      return
    }

    setCurrentTab(tab)
  }

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

    setIsLoading(true)

    window.studio.script
      .openScript(scriptPath)
      .then(({ script, options }) => {
        setScript(script)
        setOptions(options)
      })
      .catch(() => {
        showToast({
          status: 'error',
          title: 'Failed to open the script',
          description: 'An error occurred while opening the script.',
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [scriptPath, isExternal, showToast])

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

    setIsRunning(true)
    setCurrentTab('debugger')

    await startDebugging()
  }

  function handleRunInCloud() {
    setShowRunInCloudDialog(true)
  }

  async function handleStopScript() {
    await stopDebugging()

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

  return (
    <View
      key={scriptPath}
      title="Validator"
      subTitle={file ? <FileNameHeader file={file} /> : null}
      loading={isLoading}
      actions={
        <ValidatorControls
          isRunning={isRunning}
          isExternal={isExternal}
          isScriptSelected={Boolean(scriptPath)}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleDebugScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
    >
      <Tabs.Root
        key={scriptPath}
        asChild
        value={currentTab}
        onValueChange={handleTabChange}
      >
        <Flex flexGrow="1" direction="column" align="stretch">
          <Tabs.List>
            <Tabs.Trigger value="script">Script</Tabs.Trigger>
            <Tabs.Trigger value="debugger">Debugger</Tabs.Trigger>
          </Tabs.List>
          <TabContent value="script">
            <Box position="absolute" inset="0">
              <ReadOnlyEditor value={script} language="javascript" />
            </Box>
          </TabContent>
          <TabContent value="debugger">
            <Flex
              css={css`
                flex: 1 1 0;
              `}
              justify="center"
            >
              <Debugger
                options={options}
                session={session}
                onDebugScript={handleDebugScript}
              />
            </Flex>
          </TabContent>
        </Flex>
      </Tabs.Root>
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
