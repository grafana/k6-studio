import { css } from '@emotion/react'
import { Button, Flex, ScrollArea } from '@radix-ui/themes'
import { CircleCheckIcon, FileBracesIcon } from 'lucide-react'
import { useState } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { FileList } from '@/components/FileList'
import { CreateTestButton, NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'

import { useFiles } from './Sidebar.hooks'
import { SidebarHeader } from './SidebarHeader'

interface RunTabProps {
  onCollapseSidebar: () => void
}

export function RunTab({ onCollapseSidebar }: RunTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { scripts, counts } = useFiles(searchTerm)
  const handleOpenScript = useOpenExternalScript()
  const isEmpty = counts.scripts === 0 && searchTerm === ''

  return (
    <>
      <SidebarHeader
        icon={<FileBracesIcon />}
        title="Scripts"
        actions={<NewTestMenu />}
        onCollapseSidebar={onCollapseSidebar}
      />
      {isEmpty ? (
        <EmptyMessage
          px="3"
          message="Create a test or open an external k6 script to debug it."
          action={
            <Flex gap="2" wrap="wrap" justify="center">
              <CreateTestButton />
              <Button variant="soft" onClick={handleOpenScript}>
                <CircleCheckIcon /> Open script
              </Button>
            </Flex>
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
            placeholder={'Search scripts...'}
            size="1"
            onChange={setSearchTerm}
          />
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" pb="2">
              <FileList files={scripts} noFilesMessage="No scripts found" />
            </Flex>
          </ScrollArea>
        </>
      )}
    </>
  )
}
