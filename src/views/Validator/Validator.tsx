import { css } from '@emotion/react'
import { Box, Button, Flex, ScrollArea, Tabs } from '@radix-ui/themes'
import { BugPlayIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { ChecksSection } from '@/components/Validator/ChecksSection'
import { LogsSection } from '@/components/Validator/LogsSection'
import { RequestList } from '@/components/WebLogView'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import { useDebugSession, useScriptPath } from './Validator.hooks'
import { ValidatorControls } from './ValidatorControls'
import { DebugSession } from './types'

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

type ValidatorTabs = 'script' | 'debugger'

export function Validator() {
  const [currentTab, setCurrentTab] = useState<ValidatorTabs>('script')

  const [showRunInCloudDialog, setShowRunInCloudDialog] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [script, setScript] = useState('')
  const { scriptPath, isExternal } = useScriptPath()

  const navigate = useNavigate()
  const showToast = useToast()

  const { pending, session, startDebugging } = useDebugSession(scriptPath ?? '')

  const file: StudioFile | undefined =
    !isExternal && scriptPath
      ? {
          type: 'script',
          fileName: scriptPath,
          displayName: getFileNameWithoutExtension(scriptPath),
        }
      : undefined

  const handleTabChange = (tab: string) => {
    if (tab !== 'script' && tab !== 'debugger') {
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

  return (
    <View
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
      <Tabs.Root asChild value={currentTab} onValueChange={handleTabChange}>
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
              direction="column"
              align="stretch"
              justify="center"
            >
              {pending && (
                <DebuggerEmptyState onDebugScript={handleDebugScript} />
              )}
              {!pending && <Debugger session={session} />}
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

interface DebuggerEmptyStateProps {
  onDebugScript: () => void
}

function DebuggerEmptyState({ onDebugScript }: DebuggerEmptyStateProps) {
  return (
    <EmptyMessage
      message="Inspect what your script is doing while it runs."
      action={
        <Button onClick={onDebugScript}>
          <BugPlayIcon /> Debug script
        </Button>
      }
      justify="center"
      maxHeight="800px"
      pt="0"
      illustration={undefined}
    />
  )
}

interface DebuggerProps {
  session: DebugSession
}

function Debugger({ session }: DebuggerProps) {
  return (
    <Flex
      css={css`
        flex: 1 1 0;
        background-color: var(--gray-2);
      `}
      p="2"
      overflow="hidden"
      direction="column"
    >
      <Tabs.Root asChild defaultValue="network">
        <Flex
          direction="column"
          align="stretch"
          css={css`
            flex: 1 1 0;
            background-color: var(--color-background);
          `}
        >
          <Tabs.List>
            <Tabs.Trigger value="console">Console</Tabs.Trigger>
            <Tabs.Trigger value="network">Network</Tabs.Trigger>
            <Tabs.Trigger value="checks">Checks</Tabs.Trigger>
          </Tabs.List>
          <TabContent value="console">
            <LogsSection autoScroll={false} logs={session.logs} />
          </TabContent>
          <Tabs.Content asChild value="network">
            <div
              css={css`
                flex: 1 1 0;
                overflow: hidden;
              `}
            >
              <ScrollArea>
                <RequestList
                  requests={session.requests}
                  onSelectRequest={() => {}}
                />
              </ScrollArea>
            </div>
          </Tabs.Content>
          <TabContent value="checks">
            <ChecksSection isRunning={false} checks={session.checks} />
          </TabContent>
        </Flex>
      </Tabs.Root>
    </Flex>
  )
}
