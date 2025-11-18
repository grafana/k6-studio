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

import { Debugger } from './Debugger'
import { useDebugSession, useScript, useScriptPath } from './Validator.hooks'
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

interface ValidatorProps {
  scriptPath: string
}

function Content({ scriptPath }: ValidatorProps) {
  const { data, isLoading } = useScript(scriptPath)

  const [currentTab, setCurrentTab] = useState<ValidatorTabs>('script')
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

    setCurrentTab('debugger')

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
      key={scriptPath}
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
              <ReadOnlyEditor value={data?.script} language="javascript" />
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
                options={data?.options ?? {}}
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

export function Validator() {
  const scriptPath = useScriptPath()

  return <Content key={scriptPath} scriptPath={scriptPath} />
}
