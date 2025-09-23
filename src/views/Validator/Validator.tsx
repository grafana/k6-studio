import { css } from '@emotion/react'
import {
  Box,
  Button,
  Flex,
  Reset,
  Spinner,
  TabNav,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { BugPlayIcon, CircleCheckIcon, CircleXIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { ChecksSection } from '@/components/Validator/ChecksSection'
import { LogsSection } from '@/components/Validator/LogsSection'
import { BrowserAction, BrowserActionEvent } from '@/main/runner/schema'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { exhaustive } from '@/utils/typescript'

import { useDebugSession, useScriptPath } from './Validator.hooks'
import { ValidatorContent } from './ValidatorContent'
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
      p="1"
      overflow="hidden"
      direction="column"
    >
      <Tabs.Root asChild defaultValue="network">
        <Allotment
          vertical
          css={css`
            background-color: var(--color-background);
            border: 1px solid #1f180021;
          `}
        >
          <Allotment.Pane snap minSize={400}>
            <Allotment>
              <Allotment.Pane
                minSize={300}
                css={css`
                  display: flex;
                  height: 100%;
                `}
              >
                <Flex
                  p="2"
                  justify="center"
                  align="center"
                  width="100%"
                  height="100%"
                >
                  <Flex
                    css={css`
                      aspect-ratio: 16 / 9;
                      height: 100%;
                      max-width: 100%;
                      background-color: var(--gray-4);
                    `}
                    direction="column"
                    align="center"
                    justify="center"
                  >
                    TODO: A replay of the browser session
                  </Flex>
                </Flex>
              </Allotment.Pane>
              <Allotment.Pane minSize={400} preferredSize={600}>
                <Box
                  py="2"
                  px="3"
                  css={css`
                    border-bottom: 1px solid var(--gray-a5);
                  `}
                >
                  <Text size="2" weight="medium">
                    Browser actions
                  </Text>
                </Box>
                <BrowserActionList actions={session.browserActions} />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
          <Allotment.Pane minSize={40} maxSize={40}>
            <TabNav.Root>
              <Tabs.List>
                <Tabs.Trigger value="network">Network</Tabs.Trigger>
                <Tabs.Trigger value="checks">Checks</Tabs.Trigger>
                <Tabs.Trigger value="console">Console</Tabs.Trigger>
              </Tabs.List>
            </TabNav.Root>
          </Allotment.Pane>
          <Allotment.Pane snap minSize={150}>
            <Box height="100%" width="100%">
              <Flex
                direction="column"
                align="stretch"
                height="100%"
                overflow="hidden"
              >
                <TabContent value="console">
                  <LogsSection autoScroll={false} logs={session.logs} />
                </TabContent>
                <Tabs.Content asChild value="network">
                  <div
                    css={css`
                      overflow: hidden;
                      flex: 1 1 0;
                    `}
                  >
                    <ValidatorContent
                      script=""
                      session={session}
                      isRunning={false}
                      noDataElement={<></>}
                    />
                  </div>
                </Tabs.Content>
                <TabContent value="checks">
                  <ChecksSection isRunning={false} checks={session.checks} />
                </TabContent>
              </Flex>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Tabs.Root>
    </Flex>
  )
}

interface BrowserActionListProps {
  actions: BrowserActionEvent[]
}

function BrowserActionList({ actions }: BrowserActionListProps) {
  return (
    <Reset>
      <ul>
        {actions.map((action) => (
          <BrowserActionItem key={action.eventId} event={action} />
        ))}
      </ul>
    </Reset>
  )
}

function formatDuration(started: number, ended: number) {
  return `${((ended - started) / 1000).toFixed(1)}s`
}

interface BrowserActionTextProps {
  action: BrowserAction
}

function BrowserActionText({ action }: BrowserActionTextProps) {
  switch (action.type) {
    case 'goto':
      return `Navigate to ${action.url}`

    case 'click':
      return `Click element ${action.selector}`

    default:
      return exhaustive(action)
  }
}

interface BrowserActionItemProps {
  event: BrowserActionEvent
}

function BrowserActionItem({ event }: BrowserActionItemProps) {
  const [ended, setEnded] = useState(
    event.type === 'end' ? event.timestamp.ended : Date.now()
  )

  useEffect(() => {
    if (event.type === 'end') {
      setEnded(event.timestamp.ended)

      return
    }

    const interval = setInterval(() => {
      setEnded(Date.now())
    }, 100)

    return () => clearInterval(interval)
  }, [event])

  const result = event.type === 'end' ? event.result : null

  return (
    <Text asChild size="2">
      <li
        css={css`
          display: grid;
          grid-template-columns: 24px 1fr auto;
          align-items: center;
          padding: var(--space-2);
          gap: var(--space-2);

          border-bottom: 1px solid var(--gray-5);
        `}
      >
        <Flex
          minWidth="20px"
          justify="center"
          align="center"
          css={css`
            svg.lucide {
              min-width: 20px;
              min-height: 20px;
            }
          `}
          gap="2"
        >
          {event.type === 'begin' && <Spinner />}
          {result?.type === 'success' && (
            <CircleCheckIcon color="var(--green-11)" />
          )}
          {result?.type === 'error' && <CircleXIcon color="var(--red-11)" />}
        </Flex>
        <div
          css={css`
            flex: 1 1 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          <BrowserActionText action={event.action} />
        </div>
        <div>
          <div>{formatDuration(event.timestamp.started, ended)}</div>
        </div>
        {result?.type === 'error' && (
          <div
            css={css`
              color: var(--red-11);
              grid-column: 2 / span 1;
            `}
          >
            Error: {result.error}
          </div>
        )}
      </li>
    </Text>
  )
}
