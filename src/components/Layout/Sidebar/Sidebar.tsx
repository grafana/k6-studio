import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PinLeftIcon, PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { FileTree } from '@/components/FileTree'
import { useFiles } from './Sidebar.hooks'
import { Link } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { SearchField } from '@/components/SearchField'
import { useState } from 'react'

interface SidebarProps {
  isExpanded?: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { recordings, generators, scripts } = useFiles(searchTerm)

  const createNewGenerator = useCreateGenerator()

  return (
    <Box
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
    >
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
            <PinLeftIcon />
          </IconButton>
        )}
      </Flex>
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2">
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
                  asChild
                  aria-label="New generator"
                  variant="ghost"
                  size="1"
                  onClick={createNewGenerator}
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
        </Flex>
      </ScrollArea>
    </Box>
  )
}
