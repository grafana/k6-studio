import { Button, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import {
  FileSpreadsheetIcon,
  PlusIcon,
  UploadIcon,
  WrenchIcon,
} from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { CreateTestButton, NewTestMenu } from '@/components/NewTestMenu'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from '@/components/primitives/ResizablePanel'
import { useImportDataFile } from '@/hooks/useImportDataFile'

import { useFiles } from './Sidebar.hooks'
import { SidebarEmptyState } from './SidebarEmptyState'
import { SidebarHeader } from './SidebarHeader'
import { SidebarSearchBar } from './SidebarSearchBar'

interface BuildTabProps {
  onCollapseSidebar: () => void
}

export function BuildTab({ onCollapseSidebar }: BuildTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { tests, dataFiles, isEmpty } = useFiles(searchTerm)
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
          {isEmpty.tests ? (
            <SidebarEmptyState
              message="Build a test from scratch or transform a recording into one."
              action={<CreateTestButton />}
            />
          ) : (
            <>
              <SidebarSearchBar
                filter={searchTerm}
                placeholder="Search tests..."
                onChange={setSearchTerm}
              />
              <ScrollArea scrollbars="vertical">
                <Flex direction="column" gap="2" py="2">
                  <FileList files={tests} noFilesMessage="No tests found" />
                </Flex>
              </ScrollArea>
            </>
          )}
        </Flex>
      </Panel>
      <Separator />
      <Panel minSize={200} defaultSize="20%" id="sidebar-build-tab-data-files">
        <SidebarHeader
          icon={<FileSpreadsheetIcon />}
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
        {isEmpty.dataFiles ? (
          <SidebarEmptyState
            message="Import CSV or JSON files to use in parameterization rules."
            action={
              <Button size="1" variant="soft" onClick={handleImportDataFile}>
                <UploadIcon /> Import data file
              </Button>
            }
          />
        ) : (
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" py="2">
              <FileList
                files={dataFiles}
                noFilesMessage="No data files found"
              />
            </Flex>
          </ScrollArea>
        )}
      </Panel>
    </Group>
  )
}
