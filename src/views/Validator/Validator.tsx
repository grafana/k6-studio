import { css } from '@emotion/react'
import {
  Flex,
  Reset,
  ScrollArea,
  Slot,
  Spinner,
  Table,
  Tabs,
} from '@radix-ui/themes'
import { Allotment, AllotmentHandle, LayoutPriority } from 'allotment'
import { CheckCircleIcon, CircleXIcon, TerminalIcon } from 'lucide-react'
import {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useMeasure } from 'react-use'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { ChecksSection } from '@/components/Validator/ChecksSection'
import { LogsSection } from '@/components/Validator/LogsSection'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import { useDebugSession, useScriptPath } from './Validator.hooks'
import { ValidatorContent } from './ValidatorContent'
import { ValidatorControls } from './ValidatorControls'
import { ValidatorEmptyState } from './ValidatorEmptyState'

function toDurationInSeconds(start: number, end: number) {
  return ((end - start) / 1000).toFixed(1)
}

type ValidatorTabs = 'script' | 'requests' | 'checks' | 'browser'

interface LogsTriggerProps {
  count: number
  onClick?: () => void
}

const LogsTrigger = forwardRef<HTMLDivElement, LogsTriggerProps>(
  function LogsTrigger({ count, onClick }, ref) {
    return (
      <div ref={ref}>
        <Reset>
          <button
            css={css`
              font-size: var(--font-size-2);
              font-weight: var(--font-weight-medium);
              width: 100%;
              display: flex;
              align-items: center;
              gap: var(--space-2);
              padding: var(--space-2) var(--space-4);
              background-color: var(--gray-2);
            `}
            onClick={onClick}
          >
            <TerminalIcon /> Logs ({count})
          </button>
        </Reset>
      </div>
    )
  }
)

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
        <ScrollArea>{children}</ScrollArea>
      </Flex>
    </Tabs.Content>
  )
}

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
    if (
      tab !== 'script' &&
      tab !== 'requests' &&
      tab !== 'checks' &&
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

  async function handleRunScript() {
    if (!scriptPath) {
      return
    }

    setIsRunning(true)
    setCurrentTab('requests')

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
      actions={
        <ValidatorControls
          isRunning={isRunning}
          isExternal={isExternal}
          isScriptSelected={Boolean(scriptPath)}
          onDeleteScript={handleDeleteScript}
          onRunScript={handleRunScript}
          onRunInCloud={handleRunInCloud}
          onSelectScript={handleSelectExternalScript}
          onStopScript={handleStopScript}
        />
      }
      loading={isLoading}
    >
      <BottomDrawerAllotment
        top={
          <Tabs.Root asChild value={currentTab} onValueChange={handleTabChange}>
            <Flex flexGrow="1" minHeight="100%" direction="column">
              <Tabs.List>
                <Tabs.Trigger value="script">Script</Tabs.Trigger>
                {!pending && (
                  <>
                    <Tabs.Trigger value="requests" disabled={pending}>
                      Requests ({session.requests.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger value="browser" disabled={pending}>
                      Browser ({session.browserActions.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger value="checks" disabled={pending}>
                      Checks ({session.checks.length})
                    </Tabs.Trigger>
                  </>
                )}
              </Tabs.List>
              <TabContent value="script">
                <div
                  css={css`
                    position: absolute;
                    inset: 0;
                  `}
                >
                  <ReadOnlyEditor value={script} language="typescript" />
                </div>
              </TabContent>
              <TabContent value="requests">
                <ValidatorContent
                  script={script}
                  session={session}
                  isRunning={isRunning}
                  noDataElement={
                    <EmptyMessage
                      message={
                        <ValidatorEmptyState
                          isRunning={isRunning}
                          isScriptSelected={Boolean(scriptPath)}
                          onRunScript={handleRunScript}
                          onSelectScript={handleSelectExternalScript}
                        />
                      }
                    />
                  }
                />
              </TabContent>
              <TabContent value="browser">
                <Table.Root size="2" layout="fixed">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell width="28px"></Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell width="100px"></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {session.browserActions.map((event) => {
                      return (
                        <Table.Row key={event.eventId}>
                          <Table.Cell>
                            <Flex align="center">
                              {event.type === 'begin' ? (
                                <Spinner />
                              ) : event.result.type === 'success' ? (
                                <CheckCircleIcon
                                  display="block"
                                  color="var(--green-11)"
                                />
                              ) : (
                                <CircleXIcon
                                  display="block"
                                  color="var(--red-11)"
                                />
                              )}
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            {event.action.type === 'goto' && (
                              <>Go to {event.action.url}</>
                            )}
                            {event.action.type === 'click' && (
                              <>Click {event.action.selector}</>
                            )}
                          </Table.Cell>
                          <Table.Cell align="right" pr="2">
                            {toDurationInSeconds(
                              event.timestamp.started,
                              event.type === 'end'
                                ? event.timestamp.ended
                                : Date.now()
                            )}
                            s
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </TabContent>
              <TabContent value="checks">
                <ChecksSection isRunning={isRunning} checks={session.checks} />
              </TabContent>
            </Flex>
          </Tabs.Root>
        }
        trigger={<LogsTrigger count={session.logs.length} />}
        bottom={<LogsSection logs={session.logs} autoScroll={isRunning} />}
      />

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

/**
 * This sets the ratio of the top and bottom to such an absurd degree that
 * the bottom pane is forced to take its minimum size.
 */
const CLOSED_SIZE = [Number.MAX_SAFE_INTEGER, 1]

interface BottomDrawerAllotmentProps {
  defaultOpen?: boolean
  defaultSizes?: [number, number]
  trigger: ReactNode
  bottom: ReactNode
  top: ReactNode
}

function BottomDrawerAllotment({
  defaultOpen = false,
  defaultSizes = [600, 200],
  top,
  trigger,
  bottom,
}: BottomDrawerAllotmentProps) {
  const allotmentRef = useRef<AllotmentHandle>(null)
  const initializedRef = useRef(false)

  const [triggerRef, triggerDimensions] = useMeasure<HTMLElement>()

  const [sizes, setSizes] = useState(defaultOpen ? defaultSizes : CLOSED_SIZE)
  const [showDrawer, setShowDrawer] = useState(defaultOpen)

  const initializeSizes = useCallback(
    ([top = 0, bottom = 0]: number[]) => {
      if (initializedRef.current) {
        return
      }

      initializedRef.current = true

      setSizes([top, bottom])

      if (!showDrawer) {
        allotmentRef.current?.resize(CLOSED_SIZE)
      }
    },
    [showDrawer]
  )

  const handleDragEnd = useCallback(
    ([top = 0, bottom = 0]: number[]) => {
      const isMinimized = bottom <= triggerDimensions.height

      setShowDrawer(!isMinimized)

      if (!isMinimized) {
        initializedRef.current = true

        setSizes([top, bottom])
      }
    },
    [triggerDimensions]
  )

  const handleToggle = useCallback(() => {
    const shouldShow = !showDrawer

    setShowDrawer(shouldShow)

    allotmentRef.current?.resize(shouldShow ? sizes : CLOSED_SIZE)
  }, [showDrawer, sizes])

  return (
    <Allotment
      ref={allotmentRef}
      vertical={true}
      defaultSizes={defaultSizes}
      onDragEnd={handleDragEnd}
      onChange={initializeSizes}
    >
      <Allotment.Pane priority={LayoutPriority.High}>{top}</Allotment.Pane>
      <Allotment.Pane
        priority={LayoutPriority.Low}
        minSize={triggerDimensions.height}
      >
        <Slot
          ref={triggerRef}
          aria-expanded={showDrawer}
          onClick={handleToggle}
        >
          {trigger}
        </Slot>
        {bottom}
      </Allotment.Pane>
    </Allotment>
  )
}
