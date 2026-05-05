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
import { StudioFile } from '@/types'

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
          <TestsBody
            isEmpty={isEmpty.tests}
            tests={tests}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </Flex>
      </Panel>
      <Separator />
      <Panel minSize={200} defaultSize="20%" id="sidebar-build-tab-data-files">
        <DataFilesPanel
          isEmpty={isEmpty.dataFiles}
          dataFiles={dataFiles}
          onCollapseSidebar={onCollapseSidebar}
        />
      </Panel>
    </Group>
  )
}

interface TestsBodyProps {
  isEmpty: boolean
  tests: StudioFile[]
  searchTerm: string
  onSearchChange: (value: string) => void
}

function TestsBody({
  isEmpty,
  tests,
  searchTerm,
  onSearchChange,
}: TestsBodyProps) {
  if (isEmpty) {
    return (
      <SidebarEmptyState
        message="Build a test from scratch or transform a recording into one."
        action={<CreateTestButton />}
      />
    )
  }

  return (
    <>
      <SidebarSearchBar
        filter={searchTerm}
        placeholder="Search tests..."
        onChange={onSearchChange}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" py="2">
          <FileList files={tests} noFilesMessage="No tests found" />
        </Flex>
      </ScrollArea>
    </>
  )
}

interface DataFilesPanelProps {
  isEmpty: boolean
  dataFiles: StudioFile[]
  onCollapseSidebar: () => void
}

function DataFilesPanel({
  isEmpty,
  dataFiles,
  onCollapseSidebar,
}: DataFilesPanelProps) {
  const handleImportDataFile = useImportDataFile()

  return (
    <>
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
      <DataFilesBody
        isEmpty={isEmpty}
        dataFiles={dataFiles}
        onImport={handleImportDataFile}
      />
    </>
  )
}

interface DataFilesBodyProps {
  isEmpty: boolean
  dataFiles: StudioFile[]
  onImport: () => void
}

function DataFilesBody({ isEmpty, dataFiles, onImport }: DataFilesBodyProps) {
  if (isEmpty) {
    return (
      <SidebarEmptyState
        message="Import CSV or JSON files to use in parameterization rules."
        action={
          <Button size="1" variant="ghost" onClick={onImport}>
            <UploadIcon /> Import data file
          </Button>
        }
      />
    )
  }

  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" gap="2" py="2">
        <FileList files={dataFiles} noFilesMessage="No data files found" />
      </Flex>
    </ScrollArea>
  )
}
