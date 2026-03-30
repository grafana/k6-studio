import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { FolderTreeIcon } from 'lucide-react'
import { useState } from 'react'

import { WorkspaceFileTree } from '@/components/WorkspaceFileTree'

import { SidebarSearchField } from './SidebarSearchField'
import { SidebarViewLayout } from './SidebarViewLayout'

interface SidebarWorkspaceViewProps {
  onCollapseSidebar: () => void
}

export function SidebarWorkspaceView({
  onCollapseSidebar,
}: SidebarWorkspaceViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <SidebarViewLayout
      icon={<FolderTreeIcon aria-hidden />}
      heading="Workspace"
      onCollapseSidebar={onCollapseSidebar}
    >
      <Flex
        direction="column"
        gap="2"
        css={css`
          flex: 1 1 0;
          min-height: 0;
        `}
      >
        <SidebarSearchField
          filter={searchTerm}
          placeholder="Find files..."
          onChange={setSearchTerm}
        />
        <ScrollArea
          scrollbars="vertical"
          css={css`
            flex: 1 1 0;
            min-height: 0;
            height: 100%;
          `}
        >
          <WorkspaceFileTree nameFilter={searchTerm} />
        </ScrollArea>
      </Flex>
    </SidebarViewLayout>
  )
}
