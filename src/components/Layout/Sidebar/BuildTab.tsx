import { css } from '@emotion/react'
import { Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from '@/components/primitives/ResizablePanel'
import { useImportDataFile } from '@/hooks/useImportDataFile'

import { useFiles } from './Sidebar.hooks'
import { SidebarHeader } from './SidebarHeader'

interface BuildTabProps {
  onCollapseSidebar: () => void
}

export function BuildTab({ onCollapseSidebar }: BuildTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { tests, dataFiles } = useFiles(searchTerm)
  const handleImportDataFile = useImportDataFile()

  const layout = useDefaultLayout({
    groupId: 'sidebar-build-tab',
    storage: localStorage,
  })

  return (
    <Group {...layout} id="sidebar-build-tab" orientation="vertical">
      <Panel minSize={200} defaultSize="80%" id="sidebar-build-tab-main">
        <Flex direction="column" height="100%">
          <SidebarHeader
            icon={<WrenchIcon />}
            title="Tests"
            actions={<NewTestMenu />}
            onCollapseSidebar={onCollapseSidebar}
          />
          <SearchField
            css={css`
              margin: var(--space-2) var(--space-3);
              height: var(--space-5);
            `}
            filter={searchTerm}
            placeholder={'Search tests...'}
            size="1"
            onChange={setSearchTerm}
          />
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" pb="2">
              <FileList files={tests} noFilesMessage="No tests found" />
            </Flex>
          </ScrollArea>
        </Flex>
      </Panel>
      <Separator />
      <Panel minSize={200} defaultSize="20%" id="sidebar-build-tab-data-files">
        <SidebarHeader
          icon={<WrenchIcon />}
          title="Data files"
          actions={
            <Tooltip content="Import data file" side="right">
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={handleImportDataFile}
              >
                <PlusIcon />
              </IconButton>
            </Tooltip>
          }
          variant="secondary"
          onCollapseSidebar={onCollapseSidebar}
        />
        <ScrollArea scrollbars="vertical">
          <Flex direction="column" gap="2" pb="2">
            <FileList files={dataFiles} noFilesMessage="No data files found" />
          </Flex>
        </ScrollArea>
      </Panel>
    </Group>
  )
}
