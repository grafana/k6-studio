import { Box, Flex, IconButton, ScrollArea } from '@radix-ui/themes'
import { PinLeftIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'

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
              isExpanded && (
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
              )
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
