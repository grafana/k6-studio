import { css } from '@emotion/react'
import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { FilePlusIcon, PanelLeftCloseIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FileTree } from '@/components/FileTree'
import { NewTestMenu } from '@/components/NewTestMenu'
import { SearchField } from '@/components/SearchField'
import { useImportDataFile } from '@/hooks/useImportDataFile'
import { getRoutePath } from '@/routeMap'
import { useFeaturesStore } from '@/store/features'

import { useFiles } from './Sidebar.hooks'

interface SidebarProps {
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, tests, scripts, dataFiles } = useFiles(searchTerm)
  const handleImportDataFile = useImportDataFile()
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
        <Flex align="center" m="2" gap="2">
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
              actions={
                <Tooltip content="Import data file" side="right">
                  <IconButton
                    aria-label="Import data file"
                    variant="ghost"
                    size="1"
                    onClick={handleImportDataFile}
                  >
                    <FilePlusIcon />
                  </IconButton>
                </Tooltip>
              }
            />
          </Flex>
        </ScrollArea>
      </Flex>
    </Box>
  )
}
