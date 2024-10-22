import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { PinLeftIcon, PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'
import { Link } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'

interface SidebarProps {
  isExpanded: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const { recordings, generators, scripts } = useFolderContent()
  const createNewGenerator = useCreateGenerator()

  return (
    <Box
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      overflow="hidden"
      position="relative"
    >
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2" pt="3">
          <FileTree
            label="Recordings"
            files={recordings}
            noFilesMessage="No recordings found"
            viewPath="/recording-previewer"
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
                {isExpanded && (
                  <IconButton
                    size="1"
                    css={css`
                      margin-left: auto;
                    `}
                    variant="ghost"
                    color="gray"
                    onClick={onCollapseSidebar}
                  >
                    <PinLeftIcon />
                  </IconButton>
                )}
              </>
            }
          />
          <FileTree
            label="Test generators"
            files={generators}
            noFilesMessage="No generators found"
            viewPath="/generator"
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
            viewPath="/validator"
          />
        </Flex>
      </ScrollArea>
    </Box>
  )
}
