import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea, Tabs } from '@radix-ui/themes'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import { BrowserActionList } from '../Validator/Browser/BrowserActionList'

import {
  useBrowserScriptPreview,
  useBrowserTest,
} from './BrowserTestEditor.hooks'

export function BrowserTestEditor() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  const { data, isLoading } = useBrowserTest(fileName)
  const script = useBrowserScriptPreview(data?.actions ?? [])

  const drawerLayout = useDefaultLayout({
    groupId: 'browser-editor-drawer',
    storage: localStorage,
  })

  const mainLayout = useDefaultLayout({
    groupId: 'browser-editor-main',
    storage: localStorage,
  })

  const file: StudioFile = {
    fileName,
    displayName: getFileNameWithoutExtension(fileName),
    type: 'browser-test',
  }

  return (
    <View
      title="Browser test"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={<></>}
    >
      <Flex flexGrow="1" direction="column" align="stretch">
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
                <Panel id="main">
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
                          value={script}
                          showToolbar={false}
                          language="typescript"
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
                    <ScrollArea>
                      <BrowserActionList actions={[]} />
                    </ScrollArea>
                  </Flex>
                </Panel>
              </Group>
            </Panel>
            <Separator />
            <Panel
              id="drawer"
              css={css`
                overflow: hidden;
                display: flex;
                flex-direction: column;
              `}
              collapsible
              collapsedSize={40}
              minSize={200}
              defaultSize={39}
            >
              {/* <BrowserDebugDrawer
              css={css`
                flex: 1 1 0;
              `}
              session={session}
              onExpand={handleTabClick}
            /> */}
            </Panel>
          </Group>
        </Flex>
      </Flex>
    </View>
  )
}
