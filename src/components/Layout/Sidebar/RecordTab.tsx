import { css } from '@emotion/react'
import { Button, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyMessage } from '@/components/EmptyMessage'
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
  const { recordings, counts } = useFiles(searchTerm)
  const isEmpty = counts.recordings === 0 && searchTerm === ''

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
            >
              <Link to={getRoutePath('recorder')}>
                <PlusIcon />
              </Link>
            </IconButton>
          </Tooltip>
        }
        onCollapseSidebar={onCollapseSidebar}
      />
      {isEmpty ? (
        <EmptyMessage
          px="3"
          message="Capture HTTP traffic and browser events to start building tests."
          action={
            <Button asChild variant="soft">
              <Link to={getRoutePath('recorder')}>
                <PlusIcon /> Start recording
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchField
            css={css`
              margin: var(--space-2) var(--space-3);
              height: var(--space-5);
            `}
            filter={searchTerm}
            placeholder={'Search recordings...'}
            size="1"
            onChange={setSearchTerm}
          />
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" pb="2">
              <FileList
                files={recordings}
                noFilesMessage="No recordings found"
              />
            </Flex>
          </ScrollArea>
        </>
      )}
    </>
  )
}
