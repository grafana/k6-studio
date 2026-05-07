import { Button, IconButton, Tooltip } from '@radix-ui/themes'
import { FileBracesIcon, FolderOpenIcon } from 'lucide-react'
import { useState } from 'react'

import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'

import { useFiles } from './Sidebar.hooks'
import { SidebarFileList } from './SidebarFileList'
import { SidebarHeader } from './SidebarHeader'

interface DebugTabProps {
  onCollapseSidebar: () => void
}

export function DebugTab({ onCollapseSidebar }: DebugTabProps) {
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
      <SidebarFileList
        isEmpty={isEmpty.scripts}
        files={scripts}
        searchTerm={searchTerm}
        placeholder="Search scripts..."
        noFilesMessage="No scripts found"
        emptyMessage="Exported scripts from your tests will appear here. You can also open an external k6 script to debug it."
        emptyAction={
          <Button size="1" variant="ghost" onClick={handleOpenScript}>
            <FolderOpenIcon /> Open external script
          </Button>
        }
        onSearchChange={setSearchTerm}
      />
    </>
  )
}
