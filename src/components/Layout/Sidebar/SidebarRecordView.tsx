import { css } from '@emotion/react'
import { Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FileList } from '@/components/FileTree/FileList'
import { FileItem } from '@/components/FileTree/types'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { useRecentURLs } from '@/hooks/useRecentURLs'
import { getRoutePath } from '@/routeMap'

import { SidebarPanelHeading } from './SidebarPanelHeading'
import { SidebarRecentURLs } from './SidebarRecentURLs'

interface SidebarRecordViewProps {
  recordings: FileItem[]
}

export function SidebarRecordView({ recordings }: SidebarRecordViewProps) {
  const { recentURLs } = useRecentURLs()

  return (
    <Flex
      direction="column"
      css={css`
        flex: 1 1 0;
        min-height: 0;
      `}
    >
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
  )
}
