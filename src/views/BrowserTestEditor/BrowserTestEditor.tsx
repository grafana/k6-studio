import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { HighlightLocatorProvider } from '@/components/HighlightLocatorProvider'
import { View } from '@/components/Layout/View'
import {
  LogsSection,
  useConsoleFilter,
} from '@/components/Validator/LogsSection'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { useCurrentFile } from '@/hooks/useCurrentFile'
import { routeMap } from '@/routeMap'
import {
  AnyBrowserAction,
  BrowserTestFile,
  BrowserTestOptions,
} from '@/schemas/browserTest'
import { StudioFile } from '@/types'

import { NetworkInspector } from '../Validator/Browser/NetworkInspector'

import {
  useBrowserScriptPreview,
  useBrowserTest,
  useBrowserTestEditorLayout,
  useBrowserTestState,
  useSaveBrowserTest,
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
}

function BrowserTestEditorView({ file, data }: BrowserTestEditorViewProps) {
  const { drawerLayout, mainLayout, setDrawer, onTabClick } =
    useBrowserTestEditorLayout()

  const { mutateAsync: saveBrowserTest } = useSaveBrowserTest(file.path)

  const consoleFilter = useConsoleFilter()

  const [state, setState] = useState<ContextMenuState | null>(null)

  const { isDirty, test, setTest } = useBrowserTestState(data)

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

  const handleOptionsChange = (options: BrowserTestOptions) => {
    setTest({ ...test, options })
  }

  const handleActionsChange = (actions: AnyBrowserAction[]) => {
    setTest({ ...test, actions })
  }

  const handleAddAction = (action: AnyBrowserAction) => {
    handleActionsChange([...test.actions, action])
  }

  const handleSave = () => {
    if (!isDirty || !data) {
      return
    }

    const browserTestData: BrowserTestFile = {
      ...data,
      ...test,
    }

    void saveBrowserTest(browserTestData)
  }

  return (
    <View
      title="Browser test"
      subTitle={<FileNameHeader file={file} />}
      actions={
        <BrowserTestEditorControls
          file={file}
          preview={previewScript}
          session={session}
          isDirty={isDirty}
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
                      onAddAction={handleAddAction}
                      onShutdownDelayChange={setShutdownDelay}
                    />
                  </Panel>
                  <Separator />
                  <Panel id="actions" minSize={400}>
                    <EditableBrowserActionList
                      actions={test.actions}
                      optionsButton={
                        <BrowserTestOptionsButton
                          options={test.options}
                          onChange={handleOptionsChange}
                        />
                      }
                      onChange={handleActionsChange}
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
              </Tabs.List>
              <Separator data-disabled />
              <Panel id="drawer" panelRef={setDrawer} collapsible minSize={100}>
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
      <BrowserTestEditorView key={file.path} file={file} data={data} />
    </HighlightLocatorProvider>
  )
}
