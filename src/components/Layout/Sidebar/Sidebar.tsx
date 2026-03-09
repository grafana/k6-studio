import { css } from '@emotion/react'
import { Box, Flex, IconButton } from '@radix-ui/themes'
import { PanelLeftCloseIcon } from 'lucide-react'
import { useState } from 'react'

import { SearchField } from '@/components/SearchField'

import type { SidebarView } from '../Layout'

import { useFiles } from './Sidebar.hooks'
import { SidebarBuildView } from './SidebarBuildView'
import { SidebarDebugView } from './SidebarDebugView'
import { SidebarRecordView } from './SidebarRecordView'
import { SidebarWorkspaceView } from './SidebarWorkspaceView'

interface SidebarProps {
  view: SidebarView
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar, view }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, tests, scripts, dataFiles } = useFiles(searchTerm)

  return (
    <Box
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
      asChild
    >
      <Flex direction="column">
        <Flex align="center" justify="end" m="2" gap="2">
          <SearchField
            css={css`
              flex: 1 1 0;
            `}
            filter={searchTerm}
            placeholder="Find files..."
            size="1"
            onChange={setSearchTerm}
          />

          {isExpanded && (
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              onClick={onCollapseSidebar}
            >
              <PanelLeftCloseIcon />
            </IconButton>
          )}
        </Flex>
        {view === 'workspace' && <SidebarWorkspaceView />}
        {view === 'record' && <SidebarRecordView recordings={recordings} />}
        {view === 'build' && (
          <Box
            css={css`
              flex: 1 1 0;
              min-height: 0;
              display: flex;
              flex-direction: column;
            `}
          >
            <SidebarBuildView tests={tests} dataFiles={dataFiles} />
          </Box>
        )}
        {view === 'debug' && <SidebarDebugView scripts={scripts} />}
      </Flex>
    </Box>
  )
}
