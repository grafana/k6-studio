import { css } from '@emotion/react'
import { Button, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import {
  FileSpreadsheetIcon,
  PlusIcon,
  UploadIcon,
  WrenchIcon,
} from 'lucide-react'
import { useState } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileList } from '@/components/FileList'
import { CreateTestButton, NewTestMenu } from '@/components/NewTestMenu'
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
  const { tests, dataFiles, counts } = useFiles(searchTerm)
  const handleImportDataFile = useImportDataFile()

  const layout = useDefaultLayout({
    groupId: 'sidebar-build-tab',
    storage: localStorage,
  })

  const isTestsEmpty = counts.tests === 0 && searchTerm === ''
  const isDataFilesEmpty = counts.dataFiles === 0 && searchTerm === ''

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
          {isTestsEmpty ? (
            <EmptyMessage
              px="3"
              message="Build a test from scratch or transform a recording into one."
              action={<CreateTestButton />}
            />
          ) : (
            <>
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
        {isDataFilesEmpty ? (
          <EmptyMessage
            px="3"
            message="Import CSV or JSON files to use in parameterization rules."
            action={
              <Button variant="soft" onClick={handleImportDataFile}>
                <UploadIcon /> Import data file
              </Button>
            }
          />
        ) : (
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" pb="2">
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
