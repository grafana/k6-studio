import { Box, Flex, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import { Link } from 'react-router-dom'
import { PinLeftIcon, PlusIcon } from '@radix-ui/react-icons'

import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'
import { getRoutePath } from '@/routeMap'
import { css } from '@emotion/react'

interface SidebarProps {
  isExpanded: boolean
  onCollapseSidebar: () => void
}

export function Sidebar({ isExpanded, onCollapseSidebar }: SidebarProps) {
  const { recordings, generators, scripts } = useFolderContent()

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
                    <Link
                      to={getRoutePath('recorder')}
                      state={{ autoStart: true }}
                    >
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
