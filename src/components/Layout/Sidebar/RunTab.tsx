import { Button, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { FileBracesIcon, FolderOpenIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'
import { StudioFile } from '@/types'

import { useFiles } from './Sidebar.hooks'
import { SidebarEmptyState } from './SidebarEmptyState'
import { SidebarHeader } from './SidebarHeader'
import { SidebarSearchBar } from './SidebarSearchBar'

interface RunTabProps {
  onCollapseSidebar: () => void
}

export function RunTab({ onCollapseSidebar }: RunTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { scripts, isEmpty } = useFiles(searchTerm)
  const handleOpenScript = useOpenExternalScript()

  return (
    <>
      <SidebarHeader
        icon={<FileBracesIcon />}
        title="Scripts"
        actions={
          <Tooltip content="Open external script" side="right">
            <IconButton
              aria-label="Open external script"
              variant="ghost"
              size="1"
              color="gray"
              onClick={handleOpenScript}
            >
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
        }
        onCollapseSidebar={onCollapseSidebar}
      />
      <ScriptsBody
        isEmpty={isEmpty.scripts}
        scripts={scripts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenScript={handleOpenScript}
      />
    </>
  )
}

interface ScriptsBodyProps {
  isEmpty: boolean
  scripts: StudioFile[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onOpenScript: () => void
}

function ScriptsBody({
  isEmpty,
  scripts,
  searchTerm,
  onSearchChange,
  onOpenScript,
}: ScriptsBodyProps) {
  if (isEmpty) {
    return (
      <SidebarEmptyState
        message="Exported scripts from your tests will appear here. You can also open an external k6 script to debug it."
        action={
          <Button size="1" variant="ghost" onClick={onOpenScript}>
            <FolderOpenIcon /> Open external script
          </Button>
        }
      />
    )
  }

  return (
    <>
      <SidebarSearchBar
        filter={searchTerm}
        placeholder="Search scripts..."
        onChange={onSearchChange}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" py="2">
          <FileList files={scripts} noFilesMessage="No scripts found" />
        </Flex>
      </ScrollArea>
    </>
  )
}
