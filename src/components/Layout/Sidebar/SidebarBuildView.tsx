import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'

import { FileList } from '@/components/FileTree/FileList'
import { FileItem } from '@/components/FileTree/types'
import { NewTestMenu } from '@/components/NewTestMenu'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { useFeaturesStore } from '@/store/features'

import { SidebarPanelHeading } from './SidebarPanelHeading'

interface SidebarBuildViewProps {
  tests: FileItem[]
  dataFiles: FileItem[]
}

export function SidebarBuildView({ tests, dataFiles }: SidebarBuildViewProps) {
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

  return (
    <Flex
      direction="column"
      css={css`
        flex: 1 1 0;
        min-height: 0;
      `}
    >
      <Group
        orientation="vertical"
        css={css`
          flex: 1 1 0;
          min-height: 0;
        `}
      >
        <SidebarPanelHeading count={tests.length} actions={<NewTestMenu />}>
          {isBrowserEditorEnabled ? 'Tests' : 'Test generators'}
        </SidebarPanelHeading>
        <Panel id="tests" minSize={400}>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              height: 100%;
            `}
          >
            <Flex direction="column" gap="2" pb="2">
              <FileList
                files={tests}
                noFilesMessage={
                  isBrowserEditorEnabled
                    ? 'No tests found'
                    : 'No generators found'
                }
              />
            </Flex>
          </ScrollArea>
        </Panel>
        <Separator />
        <SidebarPanelHeading count={dataFiles.length}>
          Data files
        </SidebarPanelHeading>
        <Panel id="data-files" collapsible defaultSize={300} minSize={80}>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              height: 100%;
            `}
          >
            <Flex direction="column" gap="2" pb="2">
              <FileList
                files={dataFiles}
                noFilesMessage="No data files found"
              />
            </Flex>
          </ScrollArea>
        </Panel>
      </Group>
    </Flex>
  )
}
