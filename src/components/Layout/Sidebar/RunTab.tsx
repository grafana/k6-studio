import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { FileBracesIcon, FolderOpenIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { CreateTestButton, NewTestMenu } from '@/components/NewTestMenu'
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

  return (
    <>
      <SidebarHeader
        icon={<FileBracesIcon />}
        title="Scripts"
        actions={<NewTestMenu />}
        onCollapseSidebar={onCollapseSidebar}
      />
      <ScriptsBody
        isEmpty={isEmpty.scripts}
        scripts={scripts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  )
}

interface ScriptsBodyProps {
  isEmpty: boolean
  scripts: StudioFile[]
  searchTerm: string
  onSearchChange: (value: string) => void
}

function ScriptsBody({
  isEmpty,
  scripts,
  searchTerm,
  onSearchChange,
}: ScriptsBodyProps) {
  const handleOpenScript = useOpenExternalScript()

  if (isEmpty) {
    return (
      <SidebarEmptyState
        message="Create a test or open an external k6 script to debug it."
        action={
          <Flex gap="4" wrap="wrap" justify="center">
            <CreateTestButton />
            <Button size="1" variant="ghost" onClick={handleOpenScript}>
              <FolderOpenIcon /> Open script
            </Button>
          </Flex>
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
