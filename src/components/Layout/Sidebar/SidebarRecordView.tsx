import { Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FileTree } from '@/components/FileTree'
import { FileItem } from '@/components/FileTree/types'
import { getRoutePath } from '@/routeMap'

interface SidebarRecordViewProps {
  recordings: FileItem[]
}

export function SidebarRecordView({ recordings }: SidebarRecordViewProps) {
  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" gap="2" pb="2">
        <FileTree
          label="Recordings"
          files={recordings}
          noFilesMessage="No recordings found"
          actions={
            <>
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
            </>
          }
        />
      </Flex>
    </ScrollArea>
  )
}
