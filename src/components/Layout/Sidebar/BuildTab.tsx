import { css } from '@emotion/react'
import { Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'
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

  return (
    <Allotment defaultSizes={[4, 1]} vertical>
      <Allotment.Pane minSize={200}>
        <SidebarHeader
          icon={<WrenchIcon />}
          title="Tests"
          actions={<NewTestMenu />}
          onCollapseSidebar={onCollapseSidebar}
        />
        <SearchField
          css={css`
            margin: 0 var(--space-2);
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
      </Allotment.Pane>
      <Allotment.Pane minSize={200}>
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
      </Allotment.Pane>
    </Allotment>
  )
}
