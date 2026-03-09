import { IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FileList } from '@/components/FileTree/FileList'
import { FileItem } from '@/components/FileTree/types'
import { getRoutePath } from '@/routeMap'

import { SidebarPanelHeading } from './SidebarPanelHeading'

interface SidebarRecordViewProps {
  recordings: FileItem[]
}

export function SidebarRecordView({ recordings }: SidebarRecordViewProps) {
  return (
    <ScrollArea scrollbars="vertical">
      <SidebarPanelHeading
        count={recordings.length}
        actions={
          <Tooltip content="New recording" side="right">
            <IconButton
              asChild
              aria-label="New recording"
              variant="ghost"
              size="1"
            >
              <Link to={getRoutePath('recorder')}>
                <PlusIcon />
              </Link>
            </IconButton>
          </Tooltip>
        }
      >
        Recordings
      </SidebarPanelHeading>
      <FileList files={recordings} noFilesMessage="No recordings found" />
    </ScrollArea>
  )
}
