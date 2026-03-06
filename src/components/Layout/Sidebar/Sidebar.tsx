import { css } from '@emotion/react'
import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PanelLeftCloseIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FileTree } from '@/components/FileTree'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'
import { WorkspaceFileTree } from '@/components/WorkspaceFileTree'
import { getRoutePath } from '@/routeMap'
import { useFeaturesStore } from '@/store/features'

import type { SidebarView } from '../Layout'

import { useFiles } from './Sidebar.hooks'

interface SidebarProps {
  view: SidebarView
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar, view }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, tests, scripts, dataFiles } = useFiles(searchTerm)
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

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
        {view === 'workspace' && (
          <ScrollArea scrollbars="vertical">
            <Box px="2">
              <WorkspaceFileTree />
            </Box>
          </ScrollArea>
        )}
        {view === 'files' && (
          <ScrollArea scrollbars="vertical">
            <Flex direction="column" gap="2" pb="2">
              <FileTree
                label="Recordings"
                files={recordings}
                noFilesMessage="No recordings found"
                actions={
                  <>
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
                  </>
                }
              />
              <FileTree
                label={isBrowserEditorEnabled ? 'Tests' : 'Test generators'}
                files={tests}
                noFilesMessage={
                  isBrowserEditorEnabled
                    ? 'No tests found'
                    : 'No generators found'
                }
                actions={<NewTestMenu />}
              />
              <FileTree
                label="Scripts"
                files={scripts}
                noFilesMessage="No scripts found"
              />
              <FileTree
                label="Data files"
                files={dataFiles}
                noFilesMessage="No data files found"
              />
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </Box>
  )
}
