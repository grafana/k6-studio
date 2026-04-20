import { css } from '@emotion/react'
import { Flex, Tabs, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

import LogoGradient from '@/assets/logo-gradient.svg'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { SessionPlayer } from '@/components/SessionPlayer/SessionPlayer'
import {
  LogsSection,
  useConsoleFilter,
} from '@/components/Validator/LogsSection'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { routeMap } from '@/routeMap'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'

import { NetworkInspector } from '../Validator/Browser/NetworkInspector'
import { useDebugSession } from '../Validator/Validator.hooks'

import {
  useBrowserScriptPreview,
  useBrowserTest,
  useBrowserTestEditorLayout,
  useBrowserTestFile,
  useBrowserTestState,
  useSaveBrowserTest,
  useValidatorScript,
} from './BrowserTestEditor.hooks'
import { BrowserTestEditorControls } from './BrowserTestEditorControls'
import { EditableBrowserActionList } from './EditableBrowserActionList'

interface BrowserTestEditorViewProps {
  file: StudioFile
  data: BrowserTestFile
}

function BrowserTestEditorView({ file, data }: BrowserTestEditorViewProps) {
  const { drawerLayout, mainLayout, setDrawer, onTabClick } =
    useBrowserTestEditorLayout()

  const { mutateAsync: saveBrowserTest } = useSaveBrowserTest(file.fileName)

  const consoleFilter = useConsoleFilter()

  const test = useBrowserTestState(data)

  const previewScript = useBrowserScriptPreview(test.actions)
  const validatorScript = useValidatorScript(test.actions)

  const { session, startDebugging } = useDebugSession({
    type: 'raw',
    content: validatorScript,
    name: file.fileName,
  })

  const handleSave = () => {
    if (!test.isDirty || !data) {
      return
    }

    const browserTestData = { ...data, actions: test.plainActions }

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
          isDirty={test.isDirty}
          onStartDebugging={startDebugging}
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
                    <Tabs.Root asChild defaultValue="preview">
                      <Flex direction="column" height="100%" width="100%">
                        <Tabs.List>
                          <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
                          <Tabs.Trigger value="script">Script</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content
                          css={css`
                            flex: 1 1 0;
                            overflow: hidden;
                          `}
                          value="preview"
                        >
                          <SessionPlayer
                            key={session.id}
                            initialPage={{
                              title: 'k6 Studio',
                              href: '',
                              width: 1280,
                              height: 720,
                            }}
                            placeholder="Waiting for the initial URL..."
                            initialContent={
                              <Flex
                                align="center"
                                justify="center"
                                direction="column"
                                gap="2"
                              >
                                <img
                                  src={LogoGradient}
                                  alt="k6 Studio"
                                  css={css`
                                    width: 64px;
                                    height: 64px;
                                  `}
                                />
                                <Text size="2" color="gray">
                                  Run the test to see a preview...
                                </Text>
                              </Flex>
                            }
                            session={session}
                            highlightedSelector={null}
                          />
                        </Tabs.Content>
                        <Tabs.Content
                          css={css`
                            flex: 1 1 0;
                            overflow: hidden;
                          `}
                          value="script"
                        >
                          <ReadOnlyEditor
                            value={previewScript}
                            showToolbar={false}
                            language="typescript"
                          />
                        </Tabs.Content>
                      </Flex>
                    </Tabs.Root>
                  </Panel>
                  <Separator />
                  <Panel id="actions" minSize={400}>
                    <EditableBrowserActionList
                      actions={test.actions}
                      onAddAction={test.addAction}
                      onRemoveAction={test.removeAction}
                      onChangeAction={test.updateAction}
                      onReorderActions={test.reorderActions}
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
  const file = useBrowserTestFile()
  const navigate = useNavigate()

  const { data, isLoading } = useBrowserTest(file.fileName)

  if (isLoading) {
    return null
  }

  if (data === undefined) {
    navigate(routeMap.home)
    return null
  }

  return <BrowserTestEditorView key={file.fileName} file={file} data={data} />
}
