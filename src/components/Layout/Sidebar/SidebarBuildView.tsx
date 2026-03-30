import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { HammerIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { FileList } from '@/components/FileTree/FileList'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { useFeaturesStore } from '@/store/features'
import { useStudioUIStore } from '@/store/ui'

import { orderByFileName, useFuzzyFileList } from './Sidebar.hooks'
import { SidebarPanelHeading } from './SidebarPanelHeading'
import { SidebarSearchField } from './SidebarSearchField'
import { SidebarViewLayout } from './SidebarViewLayout'

interface SidebarBuildViewProps {
  onCollapseSidebar: () => void
}

export function SidebarBuildView({ onCollapseSidebar }: SidebarBuildViewProps) {
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

  const [searchTerm, setSearchTerm] = useState('')

  const generators = useStudioUIStore((s) => orderByFileName(s.generators))
  const browserTests = useStudioUIStore((s) => orderByFileName(s.browserTests))
  const dataFiles = useStudioUIStore((s) => orderByFileName(s.dataFiles))

  const tests = useMemo(
    () =>
      [...generators, ...browserTests].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      ),
    [generators, browserTests]
  )

  const filteredTests = useFuzzyFileList(tests, searchTerm)
  const filteredDataFiles = useFuzzyFileList(dataFiles, searchTerm)

  return (
    <SidebarViewLayout
      icon={<HammerIcon aria-hidden />}
      heading="Build"
      onCollapseSidebar={onCollapseSidebar}
    >
      <Flex
        direction="column"
        gap="2"
        css={css`
          flex: 1 1 0;
          min-height: 0;
        `}
      >
        <SidebarSearchField
          filter={searchTerm}
          placeholder="Search tests..."
          onChange={setSearchTerm}
        />
        <Group
          orientation="vertical"
          css={css`
            flex: 1 1 0;
            min-height: 0;
          `}
        >
          <Panel id="tests" minSize={400}>
            <ScrollArea
              scrollbars="vertical"
              css={css`
                height: 100%;
              `}
            >
              <Flex direction="column" gap="2" pb="2">
                <FileList
                  files={filteredTests}
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
          <SidebarPanelHeading count={filteredDataFiles.length}>
            Data files
          </SidebarPanelHeading>
          <Panel id="data-files" collapsible defaultSize={250} minSize={80}>
            <ScrollArea
              scrollbars="vertical"
              css={css`
                height: 100%;
              `}
            >
              <Flex direction="column" gap="2" pb="2">
                <FileList
                  files={filteredDataFiles}
                  noFilesMessage="No data files found"
                />
              </Flex>
            </ScrollArea>
          </Panel>
        </Group>
      </Flex>
    </SidebarViewLayout>
  )
}
