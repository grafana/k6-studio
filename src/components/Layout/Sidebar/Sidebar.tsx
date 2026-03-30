import { css } from '@emotion/react'
import { Box, Flex } from '@radix-ui/themes'

import type { SidebarView } from '../Layout'

import { useWorkspaceFolderSync } from './Sidebar.hooks'
import { SidebarBuildView } from './SidebarBuildView'
import { SidebarDebugView } from './SidebarDebugView'
import { SidebarRecordView } from './SidebarRecordView'
import { SidebarWorkspaceView } from './SidebarWorkspaceView'

interface SidebarProps {
  view: SidebarView
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ view, onCollapseSidebar }: SidebarProps) {
  useWorkspaceFolderSync()

  return (
    <Box
      css={css`
        --file-entry-spacing: calc(var(--space-1) * 1.5);
      `}
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
      asChild
    >
      <Flex direction="column">
        <Box
          css={css`
            flex: 1 1 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          `}
        >
          <Box
            css={css`
              flex: 1 1 0;
              min-height: 0;
              overflow: hidden;
              display: ${view === 'workspace' ? 'flex' : 'none'};
              flex-direction: column;
            `}
            aria-hidden={view !== 'workspace'}
          >
            <SidebarWorkspaceView onCollapseSidebar={onCollapseSidebar} />
          </Box>
          <Box
            css={css`
              flex: 1 1 0;
              min-height: 0;
              overflow: hidden;
              display: ${view === 'record' ? 'flex' : 'none'};
              flex-direction: column;
            `}
            aria-hidden={view !== 'record'}
          >
            <SidebarRecordView onCollapseSidebar={onCollapseSidebar} />
          </Box>
          <Box
            css={css`
              flex: 1 1 0;
              min-height: 0;
              overflow: hidden;
              display: ${view === 'build' ? 'flex' : 'none'};
              flex-direction: column;
            `}
            aria-hidden={view !== 'build'}
          >
            <SidebarBuildView onCollapseSidebar={onCollapseSidebar} />
          </Box>
          <Box
            css={css`
              flex: 1 1 0;
              min-height: 0;
              overflow: hidden;
              display: ${view === 'debug' ? 'flex' : 'none'};
              flex-direction: column;
            `}
            aria-hidden={view !== 'debug'}
          >
            <SidebarDebugView onCollapseSidebar={onCollapseSidebar} />
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
