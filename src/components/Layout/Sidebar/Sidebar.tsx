import { css } from '@emotion/react'
import { Box, Flex, Heading, IconButton, ScrollArea } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { FileTree } from '@/components/FileTree'
import { useFolderContent } from './Sidebar.hooks'
import K6Logo from '@/assets/logo.svg'

export function Sidebar() {
  const { recordings, generators, scripts } = useFolderContent()

  return (
    <Box
      css={css`
        background-color: var(--gray-2);
        height: 100%;
        max-height: 100%;
        max-width: 100%;
        overflow: hidden;
      `}
    >
      <Flex gap="2" align="center" mb="2" p="2">
        <IconButton asChild aria-label="Home" variant="ghost">
          <Link to="/">
            <img src={K6Logo} alt="k6 Logo" width="18" height="18" />
          </Link>
        </IconButton>
        <Heading
          size="3"
          css={css`
            flex-grow: 1;
          `}
        >
          k6 studio
        </Heading>
        <ThemeSwitcher />
      </Flex>
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="2">
          <FileTree
            label="Recordings"
            files={recordings}
            noFilesMessage="No recordings found"
            viewPath="/recording-previewer"
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
