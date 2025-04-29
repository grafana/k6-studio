import { css } from '@emotion/react'
import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { FilePlusIcon, PanelLeftCloseIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FileTree } from '@/components/FileTree'
import { SearchField } from '@/components/SearchField'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useImportDataFile } from '@/hooks/useImportDataFile'
import { getRoutePath } from '@/routeMap'

import { useFiles } from './Sidebar.hooks'

interface SidebarProps {
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, generators, scripts, dataFiles } = useFiles(searchTerm)
  const handleCreateNewGenerator = useCreateGenerator()
  const handleImportDataFile = useImportDataFile()

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
              label="Test generators"
              files={generators}
              noFilesMessage="No generators found"
              actions={
                <Tooltip content="New generator" side="right">
                  <IconButton
                    aria-label="New generator"
                    variant="ghost"
                    size="1"
                    onClick={() => handleCreateNewGenerator()}
                    css={{ cursor: 'pointer' }}
                  >
                    <PlusIcon />
                  </IconButton>
                </Tooltip>
              }
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
