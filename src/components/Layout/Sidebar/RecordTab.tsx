import { css } from '@emotion/react'
import { Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FileList } from '@/components/FileList'
import { SearchField } from '@/components/SearchField'
import { getRoutePath } from '@/routeMap'

import { useFiles } from './Sidebar.hooks'
import { SidebarHeader } from './SidebarHeader'

interface RecordTabProps {
  onCollapseSidebar: () => void
}

export function RecordTab({ onCollapseSidebar }: RecordTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings } = useFiles(searchTerm)

  return (
    <>
      <SidebarHeader
        icon={<VideoIcon />}
        title="Recordings"
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
        onCollapseSidebar={onCollapseSidebar}
      />
      <SearchField
        css={css`
          margin: 0 var(--space-2);
          height: var(--space-5);
        `}
        filter={searchTerm}
        placeholder={'Search recordings...'}
        size="1"
        onChange={setSearchTerm}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" pb="2">
          <FileList files={recordings} noFilesMessage="No recordings found" />
        </Flex>
      </ScrollArea>
    </>
  )
}
