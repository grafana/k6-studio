import { css } from '@emotion/react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { FileVideoCamera } from 'lucide-react'
import { useState } from 'react'

import { FileList } from '@/components/FileTree/FileList'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { useRecentURLs } from '@/hooks/useRecentURLs'
import { useStudioUIStore } from '@/store/ui'

import { orderByFileName, useFuzzyFileList } from './Sidebar.hooks'
import { SidebarPanelHeading } from './SidebarPanelHeading'
import { SidebarRecentURLs } from './SidebarRecentURLs'
import { SidebarSearchField } from './SidebarSearchField'
import { SidebarViewLayout } from './SidebarViewLayout'

interface SidebarRecordViewProps {
  onCollapseSidebar: () => void
}

export function SidebarRecordView({
  onCollapseSidebar,
}: SidebarRecordViewProps) {
  const { recentURLs } = useRecentURLs()
  const [searchTerm, setSearchTerm] = useState('')

  const recordings = useStudioUIStore((s) => orderByFileName(s.recordings))
  const filteredRecordings = useFuzzyFileList(recordings, searchTerm)

  return (
    <SidebarViewLayout
      icon={<FileVideoCamera aria-hidden />}
      heading="Record"
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
          placeholder="Search recordings..."
          onChange={setSearchTerm}
        />
        <Group
          orientation="vertical"
          css={css`
            flex: 1 1 0;
            min-height: 0;
          `}
        >
          <Panel id="recordings" minSize={80}>
            <ScrollArea
              scrollbars="vertical"
              css={css`
                height: 100%;
              `}
            >
              <FileList
                files={filteredRecordings}
                noFilesMessage="No recordings found"
              />
            </ScrollArea>
          </Panel>
          <Separator />
          <SidebarPanelHeading count={recentURLs.length}>
            Recent URLs
          </SidebarPanelHeading>
          <Panel id="recent-urls" collapsible defaultSize={250} minSize={80}>
            <ScrollArea
              scrollbars="vertical"
              css={css`
                height: 100%;
              `}
            >
              <Flex direction="column">
                <SidebarRecentURLs urls={recentURLs} />
              </Flex>
            </ScrollArea>
          </Panel>
        </Group>
      </Flex>
    </SidebarViewLayout>
  )
}
