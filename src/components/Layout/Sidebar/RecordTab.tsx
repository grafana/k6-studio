import { Button, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FileList } from '@/components/FileList'
import { getRoutePath } from '@/routeMap'
import { StudioFile } from '@/types'

import { useFiles } from './Sidebar.hooks'
import { SidebarEmptyState } from './SidebarEmptyState'
import { SidebarHeader } from './SidebarHeader'
import { SidebarSearchBar } from './SidebarSearchBar'

interface RecordTabProps {
  onCollapseSidebar: () => void
}

export function RecordTab({ onCollapseSidebar }: RecordTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, isEmpty } = useFiles(searchTerm)

  return (
    <>
      <SidebarHeader
        icon={<VideoIcon />}
        title="Recordings"
        actions={
          <Tooltip content="New recording" side="right">
            <IconButton
              asChild
              aria-label="New recording"
              variant="ghost"
              size="1"
              color="gray"
            >
              <Link to={getRoutePath('recorder')}>
                <PlusIcon />
              </Link>
            </IconButton>
          </Tooltip>
        }
        onCollapseSidebar={onCollapseSidebar}
      />
      <RecordingsBody
        isEmpty={isEmpty.recordings}
        recordings={recordings}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  )
}

interface RecordingsBodyProps {
  isEmpty: boolean
  recordings: StudioFile[]
  searchTerm: string
  onSearchChange: (value: string) => void
}

function RecordingsBody({
  isEmpty,
  recordings,
  searchTerm,
  onSearchChange,
}: RecordingsBodyProps) {
  if (isEmpty) {
    return (
      <SidebarEmptyState
        message="Capture HTTP traffic and browser events to start building tests."
        action={
          <Button asChild size="1" variant="ghost">
            <Link to={getRoutePath('recorder')}>
              <PlusIcon /> Start recording
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <SidebarSearchBar
        filter={searchTerm}
        placeholder="Search recordings..."
        onChange={onSearchChange}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" py="2">
          <FileList files={recordings} noFilesMessage="No recordings found" />
        </Flex>
      </ScrollArea>
    </>
  )
}
