import { css } from '@emotion/react'
import { Button, Flex, Heading, Tabs } from '@radix-ui/themes'
import { useState } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { LogsSection } from '@/components/Validator/LogsSection'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { useDeleteFile } from '@/hooks/useDeleteFile'

import { NetworkInspector } from '../Validator/Browser/NetworkInspector'
import { useDebugSession } from '../Validator/Validator.hooks'

import {
  useBrowserScriptPreview,
  useBrowserTest,
  useBrowserTestFile,
} from './BrowserTestEditor.hooks'
import { BrowserTestEditorControls } from './BrowserTestEditorControls'

export function BrowserTestEditor() {
  const file = useBrowserTestFile()

  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const { data, isLoading } = useBrowserTest(file.fileName)

  const preview = useBrowserScriptPreview()
  const { session, startDebugging } = useDebugSession({
    type: 'raw',
    content: preview,
    name: file.fileName,
  })

  const [drawer, setDrawer] = usePanelCallbackRef()
  const drawerLayout = useDefaultLayout({
    groupId: 'browser-editor-drawer',
    storage: localStorage,
  })
  const mainLayout = useDefaultLayout({
    groupId: 'browser-editor-main',
    storage: localStorage,
  })

  console.log(mainLayout)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const handleRunInCloud = () => {
    setIsRunInCloudDialogOpen(true)
  }

  const handleExportScript = (scriptName: string) => {
    void window.studio.files.save({
      location: {
        type: 'untitled',
        name: scriptName,
      },
      content: {
        type: 'script',
        content: preview,
      },
    })
  }

  // TODO: currently re-saves the opened file without changes.
  // Replace with actual save logic when adding browser actions is implemented.
  const handleSave = () => {
    if (!data) {
      return
    }
    void window.studio.browserTest.save(file.fileName, data)
  }

  const handleTabClick = () => {
    if (drawer?.isCollapsed()) {
      drawer?.resize(300)
    }
  }

  return (
    <View
      title="Browser test"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={
        <BrowserTestEditorControls
          file={file}
          session={session}
          onDelete={handleDelete}
          onExportScript={handleExportScript}
          onRunInCloud={handleRunInCloud}
          onSave={handleSave}
          onStartDebugging={startDebugging}
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
                    <Tabs.Root asChild defaultValue="script">
                      <Flex direction="column" height="100%" width="100%">
                        <Tabs.List>
                          <Tabs.Trigger
                            disabled
                            css={css`
                              /* 
                             * Since we currently only have a single tab, we disable the
                             * hover styling. This should be removed once we have more tabs.
                             */
                              cursor: default;

                              &:hover .rt-TabsTriggerInner {
                                background-color: transparent;
                              }
                            `}
                            value="script"
                          >
                            Script
                          </Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content
                          css={css`
                            flex: 1 1 0;
                            overflow: hidden;
                          `}
                          value="script"
                        >
                          <ReadOnlyEditor
                            value={preview}
                            showToolbar={false}
                            language="typescript"
                          />
                          <RunInCloudDialog
                            open={isRunInCloudDialogOpen}
                            script={{
                              type: 'raw',
                              name: file.fileName,
                              content: preview,
                            }}
                            onOpenChange={setIsRunInCloudDialogOpen}
                          />
                        </Tabs.Content>
                      </Flex>
                    </Tabs.Root>
                  </Panel>
                  <Separator />
                  <Panel id="actions" minSize={400}>
                    <Flex direction="column" height="100%">
                      <Flex
                        justify="between"
                        pr="2"
                        css={css`
                          border-bottom: 1px solid var(--gray-a5);
                        `}
                      >
                        <Flex align="center" gap="1">
                          <Heading
                            size="2"
                            weight="medium"
                            css={css`
                              min-height: 40px;
                              padding: 0 var(--space-2);
                              display: flex;
                              align-items: center;
                            `}
                          >
                            Browser actions ({data?.actions.length ?? 0})
                          </Heading>
                        </Flex>
                      </Flex>
                      <EmptyMessage
                        message="Build your browser test by adding actions."
                        action={<Button disabled>Add action</Button>}
                      />
                    </Flex>
                  </Panel>
                </Group>
              </Panel>
              <Separator />
              <Tabs.List>
                <Tabs.Trigger value="console" onClick={handleTabClick}>
                  Console ({session.logs.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="network" onClick={handleTabClick}>
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
                    <LogsSection autoScroll={false} logs={session.logs} />
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
