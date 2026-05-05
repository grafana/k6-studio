import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { FolderOpenIcon, FileBracesIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { CreateTestButton, NewTestMenu } from '@/components/NewTestMenu'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'

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
        actions={<NewTestMenu />}
        onCollapseSidebar={onCollapseSidebar}
      />
      {isEmpty.scripts ? (
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
      ) : (
        <>
          <SidebarSearchBar
            filter={searchTerm}
            placeholder="Search scripts..."
            onChange={setSearchTerm}
          />
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" py="2">
              <FileList files={scripts} noFilesMessage="No scripts found" />
            </Flex>
          </ScrollArea>
        </>
      )}
    </>
  )
}
