import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { HighlightLocatorProvider } from '@/components/HighlightLocatorProvider'
import { HtmlInspector } from '@/components/HtmlInspector'
import { View } from '@/components/Layout/View'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import {
  LogsSection,
  useConsoleFilter,
} from '@/components/Validator/LogsSection'
import { useCurrentFile } from '@/hooks/useCurrentFile'
import { useSaveFile } from '@/hooks/useSaveFile'
import { getViewPath, routeMap } from '@/routeMap'
import { BrowserTestFile } from '@/schemas/browserTest'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { queryClient } from '@/utils/query'

import { PlayerContextProvider } from '../../components/SessionPlayer/PlayerContext'
import { NetworkInspector } from '../Validator/Browser/NetworkInspector'

import {
  useBrowserScriptPreview,
  useBrowserTest,
  useBrowserTestEditorLayout,
  useBrowserTestState,
  useBrowserTestValidator,
} from './BrowserTestEditor.hooks'
import { BrowserTestEditorControls } from './BrowserTestEditorControls'
import { BrowserTestOptionsButton } from './BrowserTestOptionsButton'
import { BrowserTestPreview } from './BrowserTestPreview'
import { EditableBrowserActionList } from './EditableBrowserActionList'
import { ContextMenuState } from './types'

interface BrowserTestEditorViewProps {
  file: StudioFile
  data: BrowserTestFile
  isExternal: boolean
}

function BrowserTestEditorView({
  file,
  data,
  isExternal,
}: BrowserTestEditorViewProps) {
  const { drawerLayout, mainLayout, setDrawer, onTabClick } =
    useBrowserTestEditorLayout()

  const showToast = useToast()
  const navigate = useNavigate()

  const consoleFilter = useConsoleFilter()

  const [state, setState] = useState<ContextMenuState | null>(null)

  const test = useBrowserTestState(data)

  const previewScript = useBrowserScriptPreview(test.actions, test.options)

  const {
    session,
    shutdownDelay,
    setShutdownDelay,
    startDebugging,
    stopDebugging,
  } = useBrowserTestValidator({
    file,
    actions: test.actions,
    options: test.options,
  })

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'browser-test' as const,
      data: {
        ...data,
        actions: test.actions,
        options: test.options,
      },
      isExternal,
    }),
    filters: [{ name: 'Browser Test', extensions: ['k6b'] }],
    onSave: async (location) => {
      await queryClient.invalidateQueries({
        queryKey: ['browserTest', location.path],
      })

      if (location.path !== file.path) {
        navigate(getViewPath('browser-test', location.path), { replace: true })
      }
    },
    onError: (error) => {
      showToast({
        title: 'Failed to save browser test',
        status: 'error',
        description: error.message,
      })
      log.error(error)
    },
  })

  const handleSave = () => {
    void saveFile({ saveAs: false })
  }

  return (
    <View
      title="Browser test"
      subTitle={<FileNameHeader file={file} canRename={!isExternal} />}
      actions={
        <BrowserTestEditorControls
          file={file}
          preview={previewScript}
          session={session}
          isDirty={test.isDirty}
          onStartDebugging={startDebugging}
          onStopDebugging={stopDebugging}
          onSave={handleSave}
        />
      }
    >
      <Flex flexGrow="1" direction="column" align="stretch">
        <Tabs.Root asChild defaultValue="console">
          <Flex
            css={css`
              flex: 1 1 0;
            `}
            direction="column"
          >
            <Group
              {...drawerLayout}
              id="drawer"
              css={css`
                flex: 1 1 0;
              `}
              orientation="vertical"
            >
              <Panel id="main">
                <Group
                  {...mainLayout}
                  id="main"
                  css={css`
                    height: 100%;
                  `}
                >
                  <Panel id="main" minSize={200}>
                    <BrowserTestPreview
                      state={state}
                      session={session}
                      previewScript={previewScript}
                      shutdownDelay={shutdownDelay}
                      onStateChange={setState}
                      onAddAction={test.addAction}
                      onShutdownDelayChange={setShutdownDelay}
                    />
                  </Panel>
                  <Separator />
                  <Panel id="actions" defaultSize="30%" minSize={400}>
                    <EditableBrowserActionList
                      actions={test.actions}
                      onAddAction={test.addAction}
                      onRemoveAction={test.removeAction}
                      onChangeAction={test.updateAction}
                      onReorderActions={test.reorderActions}
                      optionsButton={
                        <BrowserTestOptionsButton
                          options={test.options}
                          onLoadProfileChange={test.setLoadProfile}
                          onThresholdsChange={test.setThresholds}
                          onLoadZonesChange={test.setLoadZones}
                        />
                      }
                    />
                  </Panel>
                </Group>
              </Panel>
              <Separator />
              <Tabs.List>
                <Tabs.Trigger value="console" onClick={onTabClick}>
                  Console ({session.logs.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="network" onClick={onTabClick}>
                  Network ({session.requests.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="elements" onClick={onTabClick}>
                  Elements
                </Tabs.Trigger>
              </Tabs.List>
              <Separator data-disabled />
              <Panel
                id="drawer"
                panelRef={setDrawer}
                collapsible
                defaultSize="30%"
                minSize={100}
              >
                <Flex height="100%" direction="column" overflow="hidden">
                  <Tabs.Content
                    css={css`
                      overflow: hidden;
                      flex: 1 1 0;
                    `}
                    value="console"
                  >
                    <LogsSection
                      {...consoleFilter}
                      autoScroll={session.state === 'running'}
                      logs={session.logs}
                    />
                  </Tabs.Content>
                  <Tabs.Content
                    css={css`
                      overflow: hidden;
                      flex: 1 1 0;
                    `}
                    value="network"
                  >
                    <NetworkInspector session={session} />
                  </Tabs.Content>
                  <Tabs.Content
                    css={css`
                      overflow: hidden;
                      flex: 1 1 0;
                    `}
                    value="elements"
                  >
                    <HtmlInspector sessionState={session.state} />
                  </Tabs.Content>
                </Flex>
              </Panel>
            </Group>
          </Flex>
        </Tabs.Root>
      </Flex>
    </View>
  )
}

export function BrowserTestEditor() {
  const file = useCurrentFile('browser-test')
  const navigate = useNavigate()

  const { data, isLoading } = useBrowserTest(file.path)

  if (isLoading) {
    return null
  }

  if (data === undefined) {
    navigate(routeMap.home)
    return null
  }

  return (
    <HighlightLocatorProvider>
      <PlayerContextProvider>
        <BrowserTestEditorView
          key={file.path}
          file={file}
          data={data.data}
          isExternal={data.isExternal}
        />
      </PlayerContextProvider>
    </HighlightLocatorProvider>
  )
}
