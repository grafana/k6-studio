import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { LogsSection } from '@/components/Validator/LogsSection'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { AnyBrowserAction } from '@/main/runner/schema'

import { NetworkInspector } from '../Validator/Browser/NetworkInspector'
import { useDebugSession } from '../Validator/Validator.hooks'

import {
  useBrowserScriptPreview,
  useBrowserTest,
  useBrowserTestEditorLayout,
  useBrowserTestFile,
} from './BrowserTestEditor.hooks'
import { BrowserTestEditorControls } from './BrowserTestEditorControls'
import { EditableBrowserActionList } from './EditableBrowserActionList'

export function BrowserTestEditor() {
  const { drawerLayout, mainLayout, setDrawer, onTabClick } =
    useBrowserTestEditorLayout()
  const file = useBrowserTestFile()

  const { data, isLoading } = useBrowserTest(file.fileName)

  const [actions, setActions] = useState<AnyBrowserAction[]>(
    data?.actions || []
  )

  // Keep actions in sync when data changes
  useEffect(() => {
    if (data) {
      setActions(data.actions)
    }
  }, [data])

  const handleAddAction = (action: AnyBrowserAction) => {
    setActions((prevActions) => [...prevActions, action])
  }

  const preview = useBrowserScriptPreview()
  const { session, startDebugging } = useDebugSession({
    type: 'raw',
    content: preview,
    name: file.fileName,
  })

  return (
    <View
      title="Browser test"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={
        data ? (
          <BrowserTestEditorControls
            data={data}
            file={file}
            preview={preview}
            session={session}
            onStartDebugging={startDebugging}
          />
        ) : null
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
                        </Tabs.Content>
                      </Flex>
                    </Tabs.Root>
                  </Panel>
                  <Separator />
                  <Panel id="actions" minSize={400}>
                    <EditableBrowserActionList
                      actions={actions}
                      onAddAction={handleAddAction}
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
