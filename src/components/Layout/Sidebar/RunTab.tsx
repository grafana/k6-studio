import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { FileBracesIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'

import { useFiles } from './Sidebar.hooks'
import { SidebarHeader } from './SidebarHeader'

interface RunTabProps {
  onCollapseSidebar: () => void
}

export function RunTab({ onCollapseSidebar }: RunTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { scripts } = useFiles(searchTerm)

  return (
    <>
      <SidebarHeader
        icon={<FileBracesIcon />}
        title="Scripts"
        actions={<NewTestMenu />}
        onCollapseSidebar={onCollapseSidebar}
      />
      <SearchField
        css={css`
          margin: 0 var(--space-2);
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
  )
}
