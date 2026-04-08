import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { WrenchIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileList'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'

import { useFiles } from './Sidebar.hooks'
import { SidebarHeader } from './SidebarHeader'

interface BuildTabProps {
  onCollapseSidebar: () => void
}

export function BuildTab({ onCollapseSidebar }: BuildTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { tests } = useFiles(searchTerm)

  return (
    <>
      <SidebarHeader
        icon={<WrenchIcon />}
        title="Tests"
        actions={<NewTestMenu />}
        onCollapseSidebar={onCollapseSidebar}
      />
      <SearchField
        css={css`
          margin: 0 var(--space-2);
          height: var(--space-5);
        `}
        filter={searchTerm}
        placeholder={'Search tests...'}
        size="1"
        onChange={setSearchTerm}
      />
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" pb="2">
          <FileList files={tests} noFilesMessage="No tests found" />
        </Flex>
      </ScrollArea>
    </>
  )
}
