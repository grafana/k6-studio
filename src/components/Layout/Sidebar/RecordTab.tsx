import { Button, IconButton, Tooltip } from '@radix-ui/themes'
import { PlusIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'

import { useFiles } from './Sidebar.hooks'
import { SidebarFileList } from './SidebarFileList'
import { SidebarHeader } from './SidebarHeader'

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
      <SidebarFileList
        isEmpty={isEmpty.recordings}
        files={recordings}
        searchTerm={searchTerm}
        placeholder="Search recordings..."
        noFilesMessage="No recordings found"
        emptyMessage="Capture HTTP traffic and browser events to start building tests."
        emptyAction={
          <Button asChild size="1" variant="ghost">
            <Link to={getRoutePath('recorder')}>
              <PlusIcon /> Start recording
            </Link>
          </Button>
        }
        onSearchChange={setSearchTerm}
      />
    </>
  )
}
