import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { PlayIcon } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileTree/FileList'
import { useStudioUIStore } from '@/store/ui'

import { orderByFileName, useFuzzyFileList } from './Sidebar.hooks'
import { SidebarSearchField } from './SidebarSearchField'
import { SidebarViewLayout } from './SidebarViewLayout'

interface SidebarDebugViewProps {
  onCollapseSidebar: () => void
}

export function SidebarDebugView({ onCollapseSidebar }: SidebarDebugViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const scripts = useStudioUIStore((s) => orderByFileName(s.scripts))
  const filteredScripts = useFuzzyFileList(scripts, searchTerm)

  return (
    <SidebarViewLayout
      icon={<PlayIcon aria-hidden />}
      heading="Debug"
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
          placeholder="Search scripts..."
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
          <FileList files={filteredScripts} noFilesMessage="No scripts found" />
        </ScrollArea>
      </Flex>
    </SidebarViewLayout>
  )
}
